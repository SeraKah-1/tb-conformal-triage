# Input Quality Assurance (IQA) & Pre-Analytic Safety Guardrails
# Enforces medical imaging invariants: aspect ratio, resolution, contrast, polarity, and compression.

import numpy as np
from PIL import Image, ImageOps
from typing import Dict, Any, List

def evaluate_image_quality(pil_img: Image.Image) -> Dict[str, Any]:
    """
    Evaluates input radiograph against clinical imaging invariants:
    1. Aspect ratio (anatomical field-of-view completeness)
    2. Resolution limits (prevents fine infiltrate loss from low-res thumbnails)
    3. Dynamic range / contrast (detects washed-out, flat, or overexposed images)
    4. Photometric polarity (detects inverted MONOCHROME1 vs standard MONOCHROME2)
    5. JPEG blockiness metric (measures 8x8 DCT grid discontinuity from lossy web compression)
    """
    w, h = pil_img.size
    ar = w / float(h)

    gray = np.array(pil_img.convert("L"), dtype=np.float32)

    # 1. Aspect Ratio Guard (Standard frontal chest radiograph is roughly square: 0.65 to 1.55)
    is_valid_ar = (0.65 <= ar <= 1.55)

    # 2. Resolution Guard (Minimum 256x256 px to preserve apical reticular textures)
    is_sufficient_res = (w >= 256 and h >= 256)

    # 3. Dynamic Range Guard
    p1 = float(np.percentile(gray, 1.0))
    p99 = float(np.percentile(gray, 99.0))
    dynamic_range = float(p99 - p1)
    is_sufficient_contrast = (dynamic_range >= 35.0)

    # 4. Photometric Polarity Check (MONOCHROME2 vs MONOCHROME1)
    c_h, c_w = max(4, int(0.08 * h)), max(4, int(0.08 * w))
    corners = np.concatenate([
        gray[:c_h, :c_w].ravel(),
        gray[:c_h, -c_w:].ravel(),
        gray[-c_h:, :c_w].ravel(),
        gray[-c_h:, -c_w:].ravel(),
    ])
    mean_corner = float(np.mean(corners))

    mid_y1, mid_y2 = int(0.35 * h), int(0.65 * h)
    mid_x1, mid_x2 = int(0.40 * w), int(0.60 * w)
    center_val = float(np.mean(gray[mid_y1:mid_y2, mid_x1:mid_x2]))

    # Inverted if corners are significantly brighter than center or exceed bright threshold
    is_inverted = bool((mean_corner > 120.0) or (mean_corner > 75.0 and mean_corner > 1.30 * center_val))

    # 5. JPEG Blockiness Metric (8x8 DCT grid discontinuity ratio)
    blockiness_score = 1.0
    if h >= 64 and w >= 64:
        sub_gray = gray[16:h-16, 16:w-16]
        sh, sw = sub_gray.shape
        diff_h = np.abs(sub_gray[:, :-1] - sub_gray[:, 1:])
        cols_boundary = np.arange(7, sw - 1, 8)
        cols_intra = np.setdiff1d(np.arange(sw - 1), cols_boundary)

        diff_v = np.abs(sub_gray[:-1, :] - sub_gray[1:, :])
        rows_boundary = np.arange(7, sh - 1, 8)
        rows_intra = np.setdiff1d(np.arange(sh - 1), rows_boundary)

        if len(cols_boundary) > 0 and len(cols_intra) > 0 and len(rows_boundary) > 0 and len(rows_intra) > 0:
            mean_b_h = np.mean(diff_h[:, cols_boundary])
            mean_i_h = np.mean(diff_h[:, cols_intra]) + 1e-5
            mean_b_v = np.mean(diff_v[rows_boundary, :])
            mean_i_v = np.mean(diff_v[rows_intra, :]) + 1e-5
            blockiness_score = float(0.5 * ((mean_b_h / mean_i_h) + (mean_b_v / mean_i_v)))

    # Tightened from 1.70 to 1.40 based on empirical forensic audit:
    # 7 subtle TB cases in compressed OOD data had blockiness between 1.48 and 1.66
    is_heavy_compression = bool(blockiness_score > 1.40)

    warnings: List[str] = []
    if not is_valid_ar:
        warnings.append(f"Non-standard aspect ratio ({ar:.2f}). Possible cropped hemithorax or non-thoracic field.")
    if not is_sufficient_res:
        warnings.append(f"Low resolution ({w}x{h} px). Subtle micronodular textures may be lost.")
    if not is_sufficient_contrast:
        warnings.append(f"Low dynamic contrast range ({dynamic_range:.1f}). Image is flat, washed-out, or overexposed.")
    if is_inverted:
        warnings.append("Inverted polarity detected (MONOCHROME1). Automatically inverted to standard MONOCHROME2.")
    if is_heavy_compression:
        warnings.append(f"Elevated JPEG compression artifacts detected (Blockiness score {blockiness_score:.2f}). Risk of spurious reticular noise.")

    passed = bool(is_valid_ar and is_sufficient_contrast and not is_heavy_compression and is_sufficient_res)

    return {
        "aspect_ratio": round(ar, 3),
        "is_valid_aspect_ratio": is_valid_ar,
        "is_sufficient_resolution": is_sufficient_res,
        "dynamic_range": round(dynamic_range, 1),
        "is_sufficient_contrast": is_sufficient_contrast,
        "is_inverted": is_inverted,
        "blockiness_score": round(blockiness_score, 3),
        "is_heavy_compression": is_heavy_compression,
        "quality_passed": passed,
        "warnings": warnings
    }

def auto_correct_image(pil_img: Image.Image, iqa_result: Dict[str, Any]) -> Image.Image:
    """
    Applies non-destructive photometric corrections if required (e.g. MONOCHROME1 inversion).
    """
    if iqa_result.get("is_inverted", False):
        # Convert to L, invert, then back to RGB
        inv = ImageOps.invert(pil_img.convert("L"))
        return inv.convert("RGB")
    return pil_img
