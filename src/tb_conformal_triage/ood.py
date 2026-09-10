import os
import sys
import argparse
import time
from typing import Dict, Any, Optional, Tuple, List
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F

DEFAULT_REFERENCE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ood_reference.npz")
DEFAULT_CKPT_PATH = "/root/tb_results_v9/best_tb_conformal_model.pth"
DEFAULT_DATA_DIR = "/root/independent_tb_eval/TB_Chest_Radiography_Database"


class MahalanobisOODDetector:
    """
    Mahalanobis Out-Of-Distribution (OOD) Detector.
    Evaluates sample feature vectors against class-conditional centroids and regularized pooled covariance.
    """
    def __init__(self, reference_path: str = DEFAULT_REFERENCE_PATH, auto_load: bool = True):
        self.reference_path = reference_path
        self.mu_0: Optional[np.ndarray] = None
        self.mu_1: Optional[np.ndarray] = None
        self.inv_cov: Optional[np.ndarray] = None
        self.covariance: Optional[np.ndarray] = None
        self.threshold: float = 0.0
        self.ref_distances: Optional[np.ndarray] = None
        self.epsilon: float = 1e-4
        self.is_loaded: bool = False

        if auto_load and os.path.exists(self.reference_path):
            self.load_reference(self.reference_path)

    def load_reference(self, path: Optional[str] = None):
        target_path = path or self.reference_path
        if not os.path.exists(target_path):
            raise FileNotFoundError(f"OOD reference parameters file not found at {target_path}")

        data = np.load(target_path)
        self.mu_0 = np.asarray(data["mu_0"], dtype=np.float64)
        self.mu_1 = np.asarray(data["mu_1"], dtype=np.float64)
        self.inv_cov = np.asarray(data["inv_cov"], dtype=np.float64)
        if "covariance" in data:
            self.covariance = np.asarray(data["covariance"], dtype=np.float64)
        self.threshold = float(data["threshold"])
        if "ref_distances" in data:
            self.ref_distances = np.asarray(data["ref_distances"], dtype=np.float64)
        self.epsilon = float(data.get("epsilon", 1e-4))
        self.is_loaded = True

    def evaluate_ood(self, feature_vector: np.ndarray) -> Dict[str, Any]:
        """
        Compute minimum Mahalanobis distance D_M(x) = min_c sqrt((z - mu_c)^T Sigma^{-1} (z - mu_c)).
        Determines whether the sample is Out-Of-Distribution relative to reference calibration.
        """
        if not self.is_loaded:
            raise RuntimeError("Mahalanobis OOD Detector parameters are not loaded.")

        z = np.asarray(feature_vector, dtype=np.float64).flatten()
        if z.shape[0] != 1024:
            raise ValueError(f"Expected 1024-dimensional feature vector, got shape {z.shape}")

        # Mahalanobis distance to Normal centroid (class 0)
        diff_0 = z - self.mu_0
        d_sq_0 = float(np.dot(diff_0, np.dot(self.inv_cov, diff_0)))
        d_0 = float(np.sqrt(max(0.0, d_sq_0)))

        # Mahalanobis distance to TB centroid (class 1)
        diff_1 = z - self.mu_1
        d_sq_1 = float(np.dot(diff_1, np.dot(self.inv_cov, diff_1)))
        d_1 = float(np.sqrt(max(0.0, d_sq_1)))

        # Minimum Mahalanobis distance
        d_min = min(d_0, d_1)
        is_ood = bool(d_min > self.threshold)

        # Compute empirical percentile relative to reference cohort
        percentile = 0.0
        if self.ref_distances is not None and len(self.ref_distances) > 0:
            percentile = float(np.mean(self.ref_distances < d_min) * 100.0)

        warning = None
        if is_ood:
            warning = (
                "Deteksi OOD: Karakteristik citra berada di luar distribusi kalibrasi "
                f"(Jarak Mahalanobis {d_min:.2f} > ambang batas {self.threshold:.2f}). "
                "Wajib telaah dokter spesialis."
            )

        return {
            "mahalanobis_distance": round(d_min, 4),
            "distance_to_normal": round(d_0, 4),
            "distance_to_tb": round(d_1, 4),
            "threshold": round(self.threshold, 4),
            "is_ood": is_ood,
            "distribution_percentile": round(percentile, 2),
            "warning": warning
        }


# Global singleton instance for module-level evaluation
_GLOBAL_DETECTOR: Optional[MahalanobisOODDetector] = None

def get_global_detector(reference_path: str = DEFAULT_REFERENCE_PATH) -> MahalanobisOODDetector:
    global _GLOBAL_DETECTOR
    if _GLOBAL_DETECTOR is None or not _GLOBAL_DETECTOR.is_loaded:
        _GLOBAL_DETECTOR = MahalanobisOODDetector(reference_path=reference_path, auto_load=True)
    return _GLOBAL_DETECTOR

def evaluate_ood(feature_vector: np.ndarray, reference_path: str = DEFAULT_REFERENCE_PATH) -> Dict[str, Any]:
    """
    Module-level function to evaluate Mahalanobis OOD distance on a 1024-d feature vector.
    """
    detector = get_global_detector(reference_path)
    return detector.evaluate_ood(feature_vector)


def build_ood_reference(
    checkpoint_path: str = DEFAULT_CKPT_PATH,
    database_dir: str = DEFAULT_DATA_DIR,
    output_path: str = DEFAULT_REFERENCE_PATH,
    n_normal: int = 50,
    n_tb: int = 50,
    epsilon: float = 1e-4,
    device: str = "cpu"
) -> Dict[str, Any]:
    """
    Extracts 1024-d penultimate features from 50 Normal and 50 TB reference CXRs,
    computes class centroids and regularized pooled covariance, determines 95th percentile threshold,
    and serializes the parameters to NPZ.
    """
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from model import TBTriageEngine

    print(f"[OOD BUILD] Initializing model engine from {checkpoint_path} on {device}...")
    engine = TBTriageEngine(checkpoint_path=checkpoint_path, device=device)

    normal_dir = os.path.join(database_dir, "Normal")
    tb_dir = os.path.join(database_dir, "Tuberculosis")

    if not os.path.isdir(normal_dir) or not os.path.isdir(tb_dir):
        raise FileNotFoundError(f"Database directories not found at {database_dir}")

    norm_filenames = sorted([f for f in os.listdir(normal_dir) if f.lower().endswith((".png", ".jpg", ".jpeg"))])
    tb_filenames = sorted([f for f in os.listdir(tb_dir) if f.lower().endswith((".png", ".jpg", ".jpeg"))])

    if len(norm_filenames) < n_normal or len(tb_filenames) < n_tb:
        raise ValueError(f"Insufficient images: found {len(norm_filenames)} Normal, {len(tb_filenames)} TB")

    selected_norm = [os.path.join(normal_dir, f) for f in norm_filenames[:n_normal]]
    selected_tb = [os.path.join(tb_dir, f) for f in tb_filenames[:n_tb]]

    print(f"[OOD BUILD] Ingesting {len(selected_norm)} Normal and {len(selected_tb)} TB reference images...")

    def extract_cohort_features(file_paths: List[str]) -> np.ndarray:
        feats_list = []
        for i, fp in enumerate(file_paths):
            pil_img = Image.open(fp)
            inp_tensor, _ = engine.preprocess(pil_img)
            with torch.no_grad():
                f = engine.model.backbone.features(inp_tensor)
                out = F.relu(f, inplace=True)
                out = F.adaptive_avg_pool2d(out, (1, 1))
                feat = torch.flatten(out, 1).squeeze(0).cpu().numpy()
            feats_list.append(feat)
            if (i + 1) % 10 == 0 or (i + 1) == len(file_paths):
                print(f"  Processed [{i + 1}/{len(file_paths)}] images...")
        return np.array(feats_list, dtype=np.float64)

    print("[OOD BUILD] Extracting Normal CXR penultimate features...")
    Z0 = extract_cohort_features(selected_norm)

    print("[OOD BUILD] Extracting Tuberculosis CXR penultimate features...")
    Z1 = extract_cohort_features(selected_tb)

    N0, D0 = Z0.shape
    N1, D1 = Z1.shape
    assert D0 == 1024 and D1 == 1024, f"Feature dimension mismatch: {D0}, {D1}"

    # Centroids
    mu_0 = np.mean(Z0, axis=0)
    mu_1 = np.mean(Z1, axis=0)

    # Centered features
    diff_0 = Z0 - mu_0
    diff_1 = Z1 - mu_1

    # Unbiased pooled covariance matrix
    dof = float(N0 + N1 - 2)
    scatter_0 = np.dot(diff_0.T, diff_0)
    scatter_1 = np.dot(diff_1.T, diff_1)
    pooled_cov = (scatter_0 + scatter_1) / dof

    # Regularization: Sigma_reg = Sigma + epsilon * diag_mean * I
    diag_mean = float(np.mean(np.diag(pooled_cov)))
    reg_val = float(epsilon * diag_mean) if diag_mean > 0 else float(epsilon)
    reg_cov = pooled_cov + reg_val * np.eye(D0, dtype=np.float64)

    print(f"[OOD BUILD] Computing inverse of regularized covariance (dim={D0}x{D0}, reg_val={reg_val:.6e})...")
    inv_cov = np.linalg.inv(reg_cov)

    # Calculate Mahalanobis distance for each reference sample
    print("[OOD BUILD] Calculating reference Mahalanobis distances...")
    ref_distances = []
    for z in Z0:
        d0 = np.sqrt(max(0.0, float(np.dot(z - mu_0, np.dot(inv_cov, z - mu_0)))))
        d1 = np.sqrt(max(0.0, float(np.dot(z - mu_1, np.dot(inv_cov, z - mu_1)))))
        ref_distances.append(min(d0, d1))

    for z in Z1:
        d0 = np.sqrt(max(0.0, float(np.dot(z - mu_0, np.dot(inv_cov, z - mu_0)))))
        d1 = np.sqrt(max(0.0, float(np.dot(z - mu_1, np.dot(inv_cov, z - mu_1)))))
        ref_distances.append(min(d0, d1))

    ref_distances = np.array(ref_distances, dtype=np.float64)

    # 95th percentile threshold
    threshold_95 = float(np.percentile(ref_distances, 95.0))
    threshold_99 = float(np.percentile(ref_distances, 99.0))
    min_dist = float(np.min(ref_distances))
    max_dist = float(np.max(ref_distances))
    mean_dist = float(np.mean(ref_distances))
    median_dist = float(np.median(ref_distances))

    print(f"[OOD BUILD] Reference Distribution Statistics (N={len(ref_distances)}):")
    print(f"  Min D_M:    {min_dist:.4f}")
    print(f"  Mean D_M:   {mean_dist:.4f}")
    print(f"  Median D_M: {median_dist:.4f}")
    print(f"  95th Pctl:  {threshold_95:.4f} (Ambang Batas D_M,max)")
    print(f"  99th Pctl:  {threshold_99:.4f}")
    print(f"  Max D_M:    {max_dist:.4f}")

    # Serialize to NPZ
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    np.savez_compressed(
        output_path,
        mu_0=mu_0,
        mu_1=mu_1,
        inv_cov=inv_cov,
        covariance=reg_cov,
        threshold=threshold_95,
        ref_distances=ref_distances,
        epsilon=reg_val
    )
    print(f"[OOD BUILD] Saved OOD reference parameters to {output_path} ({os.path.getsize(output_path):,} bytes)")

    return {
        "status": "SUCCESS",
        "output_path": output_path,
        "n_normal": N0,
        "n_tb": N1,
        "feature_dim": D0,
        "threshold_95": threshold_95,
        "threshold_99": threshold_99,
        "mean_distance": mean_dist,
        "reg_epsilon": reg_val
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TB-CXR Mahalanobis OOD Detector Reference Builder")
    parser.add_argument("--generate", action="store_true", help="Generate OOD reference parameters from images")
    parser.add_argument("--ckpt", type=str, default=DEFAULT_CKPT_PATH, help="Path to best_tb_conformal_model.pth")
    parser.add_argument("--data", type=str, default=DEFAULT_DATA_DIR, help="Path to TB Chest Radiography Database")
    parser.add_argument("--output", type=str, default=DEFAULT_REFERENCE_PATH, help="Output NPZ file path")
    parser.add_argument("--n_normal", type=int, default=50, help="Number of normal CXRs")
    parser.add_argument("--n_tb", type=int, default=50, help="Number of TB CXRs")
    parser.add_argument("--epsilon", type=float, default=1e-4, help="Covariance regularization factor")
    args = parser.parse_args()

    if args.generate or not os.path.exists(args.output):
        build_ood_reference(
            checkpoint_path=args.ckpt,
            database_dir=args.data,
            output_path=args.output,
            n_normal=args.n_normal,
            n_tb=args.n_tb,
            epsilon=args.epsilon
        )
    else:
        det = MahalanobisOODDetector(reference_path=args.output)
        print(f"Loaded OOD detector: threshold={det.threshold:.4f}, dim={det.mu_0.shape}")
