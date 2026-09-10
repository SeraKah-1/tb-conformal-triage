import os
import io
import base64
import hashlib
from collections import OrderedDict
from typing import Tuple, Dict, Any, Optional

import numpy as np
from PIL import Image
import torch
import torch.nn as nn
import torch.nn.functional as F

from iqa import evaluate_image_quality, auto_correct_image
from ood import MahalanobisOODDetector

# -------------------------------------------------------------
# 1. STANDALONE DENSENET-121 ARCHITECTURE
# -------------------------------------------------------------
class _DenseLayer(nn.Module):
    def __init__(self, num_input_features, growth_rate, bn_size, drop_rate):
        super().__init__()
        self.norm1 = nn.BatchNorm2d(num_input_features)
        self.relu1 = nn.ReLU(inplace=True)
        self.conv1 = nn.Conv2d(num_input_features, bn_size * growth_rate, kernel_size=1, stride=1, bias=False)
        self.norm2 = nn.BatchNorm2d(bn_size * growth_rate)
        self.relu2 = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(bn_size * growth_rate, growth_rate, kernel_size=3, stride=1, padding=1, bias=False)
        self.drop_rate = float(drop_rate)

    def forward(self, init_features):
        features = [init_features] if isinstance(init_features, torch.Tensor) else init_features
        concated = torch.cat(features, 1)
        bottleneck = self.conv1(self.relu1(self.norm1(concated)))
        new_feats = self.conv2(self.relu2(self.norm2(bottleneck)))
        if self.drop_rate > 0:
            new_feats = F.dropout(new_feats, p=self.drop_rate, training=self.training)
        return new_feats

class _DenseBlock(nn.ModuleDict):
    def __init__(self, num_layers, num_input_features, bn_size, growth_rate, drop_rate):
        super().__init__()
        for i in range(num_layers):
            layer = _DenseLayer(num_input_features + i * growth_rate, growth_rate, bn_size, drop_rate)
            self.add_module(f"denselayer{i+1}", layer)

    def forward(self, init_features):
        features = [init_features]
        for name, layer in self.items():
            features.append(layer(features))
        return torch.cat(features, 1)

class _Transition(nn.Sequential):
    def __init__(self, num_input_features, num_output_features):
        super().__init__()
        self.norm = nn.BatchNorm2d(num_input_features)
        self.relu = nn.ReLU(inplace=True)
        self.conv = nn.Conv2d(num_input_features, num_output_features, kernel_size=1, stride=1, bias=False)
        self.pool = nn.AvgPool2d(kernel_size=2, stride=2)

class StandaloneDenseNet121(nn.Module):
    def __init__(self, num_classes=1000):
        super().__init__()
        growth_rate, block_config, num_init_features, bn_size = 32, (6, 12, 24, 16), 64, 4
        self.features = nn.Sequential(OrderedDict([
            ("conv0", nn.Conv2d(3, num_init_features, kernel_size=7, stride=2, padding=3, bias=False)),
            ("norm0", nn.BatchNorm2d(num_init_features)),
            ("relu0", nn.ReLU(inplace=True)),
            ("pool0", nn.MaxPool2d(kernel_size=3, stride=2, padding=1)),
        ]))
        num_features = num_init_features
        for i, num_layers in enumerate(block_config):
            self.features.add_module(f"denseblock{i+1}", _DenseBlock(num_layers, num_features, bn_size, growth_rate, 0.0))
            num_features += num_layers * growth_rate
            if i != len(block_config) - 1:
                self.features.add_module(f"transition{i+1}", _Transition(num_features, num_features // 2))
                num_features //= 2
        self.features.add_module("norm5", nn.BatchNorm2d(num_features))
        self.classifier = nn.Linear(num_features, num_classes)

    def forward(self, x, return_features: bool = False):
        f = self.features(x)
        out = F.relu(f, inplace=True)
        out = F.adaptive_avg_pool2d(out, (1, 1))
        feats = torch.flatten(out, 1)
        logits = self.classifier(feats)
        if return_features:
            return logits, feats
        return logits

class TBCXRClassifier(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        self.backbone = StandaloneDenseNet121(num_classes=1000)
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(1024, num_classes)
        )

    def forward(self, x, return_features: bool = False):
        return self.backbone(x, return_features=return_features)

    def extract_features(self, x):
        f = self.backbone.features(x)
        out = F.relu(f, inplace=True)
        out = F.adaptive_avg_pool2d(out, (1, 1))
        return torch.flatten(out, 1)

    def get_target_layer(self):
        return self.backbone.features.denseblock4.denselayer16.conv2

# -------------------------------------------------------------
# 2. MODEL MANAGER & INFERENCE ENGINE
# -------------------------------------------------------------
class TBTriageEngine:
    def __init__(
        self,
        checkpoint_path: str = "/root/tb_results_v9/best_tb_conformal_model.pth",
        device: str = "cpu",
        allow_autonomous_release: bool = False,
        ood_reference_path: Optional[str] = None
    ):
        self.device = torch.device(device)
        self.checkpoint_path = checkpoint_path
        self.allow_autonomous_release = allow_autonomous_release
        self.model = None
        self.optimal_temperature = 0.8349
        self.q0 = 0.2299
        self.q1 = 0.7413
        self.who_operating_point = 0.4401
        self.checkpoint_sha256 = ""
        self.ood_detector: Optional[MahalanobisOODDetector] = None

        self.load_model()

        # Load Mahalanobis OOD Detector
        ood_path = ood_reference_path or os.path.join(os.path.dirname(os.path.abspath(__file__)), "ood_reference.npz")
        if os.path.exists(ood_path):
            try:
                self.ood_detector = MahalanobisOODDetector(reference_path=ood_path)
            except Exception as e:
                print(f"[OOD INIT WARNING] Failed to load OOD detector: {e}")

    def load_model(self):
        if not os.path.exists(self.checkpoint_path):
            raise FileNotFoundError(f"Checkpoint not found at {self.checkpoint_path}")

        # Compute SHA-256
        with open(self.checkpoint_path, "rb") as f:
            self.checkpoint_sha256 = hashlib.sha256(f.read()).hexdigest()

        ckpt = torch.load(self.checkpoint_path, map_location=self.device)
        self.optimal_temperature = float(ckpt.get("optimal_temperature", 0.8349))
        q_mondrian = ckpt.get("q_mondrian", {0: 0.2299, 1: 0.7413})
        self.q0 = float(q_mondrian.get(0, 0.2299))
        self.q1 = float(q_mondrian.get(1, 0.7413))
        self.who_operating_point = float(ckpt.get("who_tpp_best_operating_point", 0.4401))

        self.model = TBCXRClassifier(num_classes=2).to(self.device)
        sd = {k.replace("module.", ""): v for k, v in ckpt["model_state_dict"].items()}
        self.model.load_state_dict(sd)
        self.model.eval()

    def preprocess(self, pil_img: Image.Image, img_size: int = 512, iqa_result: Optional[Dict[str, Any]] = None) -> Tuple[torch.Tensor, Image.Image]:
        # If photometric polarity is inverted (MONOCHROME1), automatically correct to standard MONOCHROME2
        if iqa_result is not None and iqa_result.get("is_inverted", False):
            pil_img = auto_correct_image(pil_img, iqa_result)

        # Convert to grayscale for anatomical central-thorax percentile windowing
        img_gray = np.array(pil_img.convert("L"), dtype=np.float32)
        h, w = img_gray.shape
        y1, y2 = int(0.15 * h), int(0.85 * h)
        x1, x2 = int(0.15 * w), int(0.85 * w)
        central_thorax = img_gray[y1:y2, x1:x2]
        p1 = float(np.percentile(central_thorax, 1.0))
        p99 = float(np.percentile(central_thorax, 99.0))
        denom = max(1.0, p99 - p1)
        norm = np.clip((img_gray - p1) / denom, 0.0, 1.0)
        pil_norm = Image.fromarray((norm * 255.0).astype(np.uint8)).convert("RGB")
        pil_resized = pil_norm.resize((img_size, img_size), Image.Resampling.BILINEAR)
        
        arr = np.array(pil_resized, dtype=np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        arr = (arr - mean) / std
        tensor_img = torch.tensor(arr, device=self.device).permute(2, 0, 1).unsqueeze(0)
        return tensor_img, pil_resized

    def generate_hirescam_overlay(self, inp: torch.Tensor, pil_resized: Image.Image) -> str:
        inp_var = inp.clone().detach().requires_grad_(True)
        activations = []
        gradients = []

        def forward_hook(module, input, output):
            activations.append(output)

        def backward_hook(module, grad_in, grad_out):
            gradients.append(grad_out[0])

        target_layer = self.model.get_target_layer()
        h_fwd = target_layer.register_forward_hook(forward_hook)
        h_bwd = target_layer.register_full_backward_hook(backward_hook)

        try:
            logits = self.model(inp_var)
            # Backprop for TB class (class 1)
            score = logits[0, 1]
            self.model.zero_grad()
            score.backward(retain_graph=False)

            act = activations[0].squeeze(0).detach().cpu().numpy()  # (C, H, W)
            grad = gradients[0].squeeze(0).detach().cpu().numpy()  # (C, H, W)

            # HiResCAM: Element-wise Hadamard product without spatial averaging
            cam = np.sum(act * grad, axis=0)
            cam = np.maximum(cam, 0)
            if np.max(cam) > 0:
                cam = cam / np.max(cam)

            # Resize cam to 512x512
            cam_img = Image.fromarray((cam * 255.0).astype(np.uint8)).resize(pil_resized.size, Image.Resampling.BILINEAR)
            cam_arr = np.array(cam_img, dtype=np.float32) / 255.0

            # Create RGB colormap (Jet-like: Blue to Red)
            cmap_r = np.clip(1.5 - np.abs(4.0 * cam_arr - 3.0), 0.0, 1.0)
            cmap_g = np.clip(1.5 - np.abs(4.0 * cam_arr - 2.0), 0.0, 1.0)
            cmap_b = np.clip(1.5 - np.abs(4.0 * cam_arr - 1.0), 0.0, 1.0)
            heatmap = np.stack([cmap_r, cmap_g, cmap_b], axis=-1)

            # Blend with original grayscale image
            orig_rgb = np.array(pil_resized, dtype=np.float32) / 255.0
            blended = 0.6 * orig_rgb + 0.4 * heatmap
            blended_uint8 = (np.clip(blended, 0.0, 1.0) * 255.0).astype(np.uint8)

            buf = io.BytesIO()
            Image.fromarray(blended_uint8).save(buf, format="PNG")
            b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
            return f"data:image/png;base64,{b64}"
        finally:
            h_fwd.remove()
            h_bwd.remove()

    def predict_and_triage(
        self,
        pil_img: Image.Image,
        filename: str = "cxr.png",
        generate_heatmap: bool = False,
        allow_autonomous_release: Optional[bool] = None
    ) -> Dict[str, Any]:
        effective_allow_autonomous = self.allow_autonomous_release if allow_autonomous_release is None else allow_autonomous_release

        # 1. Run Input Quality Assurance (IQA) evaluation
        iqa_report = evaluate_image_quality(pil_img)

        # 2. Preprocess with auto-correction for inverted polarity if detected
        inp, pil_resized = self.preprocess(pil_img, iqa_result=iqa_report)
        
        with torch.no_grad():
            logits, feats = self.model(inp, return_features=True)
            logits_calib = logits / self.optimal_temperature
            probs = torch.softmax(logits_calib, dim=-1).squeeze().cpu().numpy()
            feat_np = feats.squeeze(0).cpu().numpy()

        p_norm = float(probs[0])
        p_tb = float(probs[1])

        # 3. Evaluate Mahalanobis Out-Of-Distribution (OOD)
        ood_report = None
        is_ood = False
        if self.ood_detector is not None and self.ood_detector.is_loaded:
            try:
                ood_report = self.ood_detector.evaluate_ood(feat_np)
                is_ood = bool(ood_report.get("is_ood", False))
            except Exception as e:
                ood_report = {
                    "error": str(e),
                    "is_ood": False,
                    "mahalanobis_distance": 0.0,
                    "threshold": 0.0
                }

        # Mondrian Conformal Prediction Set (alpha=0.05)
        pred_set = []
        if p_norm >= (1.0 - self.q0):
            pred_set.append("Normal")
        if p_tb >= (1.0 - self.q1):
            pred_set.append("Tuberculosis")

        # Binary classification by WHO operating point
        predicted_class = "Tuberculosis" if p_tb >= self.who_operating_point else "Normal"

        # CLINICAL SAFETY INTERLOCK & IQA GUARDRAILS:
        safety_interlock = False
        warning_msgs = list(iqa_report["warnings"])

        # Base conformal triage assignment
        if pred_set == ["Normal"] and p_norm >= 0.95:
            triage_action = "AUTO_RELEASE_NORMAL"
        elif pred_set == ["Tuberculosis"] or p_tb >= 0.70:
            triage_action = "AUTO_FLAG_TB_URGENT"
        else:
            triage_action = "REFER_AMBIGUOUS_TO_DOCTOR"
            safety_interlock = True
            warning_msgs.append("Elevated epistemic uncertainty or non-conformal distribution.")

        # OOD Guardrail:
        # Jika sampel terdeteksi sebagai OOD Anomaly (D_M > D_M,max):
        # - Tandai is_ood: True
        # - Dilarang keras masuk AUTO_RELEASE_NORMAL
        # - Alihkan ke REFER_AMBIGUOUS_TO_DOCTOR dengan warning
        if is_ood:
            safety_interlock = True
            triage_action = "REFER_AMBIGUOUS_TO_DOCTOR"
            d_val = ood_report.get("mahalanobis_distance", 0.0) if ood_report else 0.0
            t_val = ood_report.get("threshold", 0.0) if ood_report else 0.0
            warning_msgs.append(
                f"Deteksi OOD: Karakteristik citra berada di luar distribusi kalibrasi (Jarak Mahalanobis {d_val:.2f} > {t_val:.2f}). Wajib telaah dokter spesialis."
            )

        # Operational Mode Guardrail:
        # allow_autonomous_release: bool = False (default False = Mode Asistif Klinis Murni,
        # di mana pelepasan mandiri tanpa dokter diblokir total untuk senter baru/tanpa kalibrasi lokal,
        # menjadi ASSISTIVE_NORMAL_DOCTOR_VERIFY atau REFER_AMBIGUOUS_TO_DOCTOR)
        if triage_action == "AUTO_RELEASE_NORMAL" and not effective_allow_autonomous:
            triage_action = "ASSISTIVE_NORMAL_DOCTOR_VERIFY"
            safety_interlock = True
            warning_msgs.append(
                "Mode Asistif Klinis Murni: Pelepasan mandiri tanpa dokter diblokir total untuk kalibrasi lokal. Wajib verifikasi dokter spesialis."
            )

        # IQA Guardrail 1: Invalid aspect ratio (e.g. cropped hemithorax) or insufficient contrast
        if not iqa_report["is_valid_aspect_ratio"] or not iqa_report["is_sufficient_contrast"]:
            triage_action = "REFER_AMBIGUOUS_TO_DOCTOR"
            safety_interlock = True
            warning_msgs.append("Quality Guard: Citra cacat/terpotong. Wajib evaluasi ulang atau foto ulang rontgen.")

        # IQA Guardrail 2: Heavy JPEG compression with borderline prediction
        # Prevents 8x8 DCT grid lines from generating false positive alarms on compressed normal images!
        if iqa_report["is_heavy_compression"] and triage_action == "AUTO_FLAG_TB_URGENT" and p_tb < 0.85:
            triage_action = "REFER_AMBIGUOUS_TO_DOCTOR"
            safety_interlock = True
            warning_msgs.append("Quality Guard: Kompresi JPEG tinggi berisiko memicu false positive. Diarahkan ke telaah dokter.")

        # IQA Guardrail 3: Heavy JPEG compression or quality defect with AUTO_RELEASE_NORMAL or ASSISTIVE_NORMAL_DOCTOR_VERIFY
        # Lossy 8x8 DCT quantization obliterates high-frequency micronodular and subtle apical infiltrates.
        # NEVER release automatically if image quality is degraded or compressed!
        if (iqa_report["is_heavy_compression"] or not iqa_report["quality_passed"]) and triage_action in ["AUTO_RELEASE_NORMAL", "ASSISTIVE_NORMAL_DOCTOR_VERIFY"]:
            triage_action = "REFER_AMBIGUOUS_TO_DOCTOR"
            safety_interlock = True
            warning_msgs.append("Safety Guard: Artefak kompresi atau degradasi citra terdeteksi. Pelepasan otomatis dicegah demi keselamatan pasien; wajib telaah dokter radiolog.")

        warning = "; ".join(warning_msgs) if warning_msgs else None

        heatmap_b64 = None
        if generate_heatmap:
            try:
                heatmap_b64 = self.generate_hirescam_overlay(inp, pil_resized)
            except Exception as e:
                warning = (warning or "") + f" [Heatmap generation warning: {str(e)}]"

        return {
            "filename": filename,
            "predicted_class": predicted_class,
            "probability_tb": round(p_tb, 4),
            "probability_normal": round(p_norm, 4),
            "decision_threshold_used": round(self.who_operating_point, 4),
            "triage_action": triage_action,
            "conformal_details": {
                "conformal_set": pred_set,
                "quantile_q0_normal": round(self.q0, 4),
                "quantile_q1_tb": round(self.q1, 4),
                "nominal_coverage_guarantee": ">= 95.0%",
                "clinical_action_code": triage_action,
                "safety_interlock_engaged": safety_interlock
            },
            "warning": warning,
            "iqa_report": iqa_report,
            "ood_report": ood_report,
            "allow_autonomous_release": effective_allow_autonomous,
            "hirescam_heatmap_base64": heatmap_b64
        }
