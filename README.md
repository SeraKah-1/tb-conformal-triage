# Selective Conformal AI Architecture for Tuberculosis Triage
### Multi-Cohort Development, BioMedCLIP Distillation, and Independent External Stress-Testing

[![Release: v2.0.0-distilled](https://img.shields.io/badge/Release-v2.0.0--distilled-059669.svg?style=flat-square)](https://github.com/SeraKah-1/tb-conformal-triage/releases/tag/v2.0.0-distilled)
[![Live Workstation: Hugging Face](https://img.shields.io/badge/%F0%9F%A4%97%20Live%20Workstation-Hugging%20Face%20Space-yellow.svg?style=flat-square)](https://huggingface.co/spaces/Ressshh/tb-conformal-triage-workstation)
[![Offline Bundle: 32.8 MB](https://img.shields.io/badge/Offline%20Bundle-32.8%20MB%20ZIP-purple.svg?style=flat-square)](https://github.com/SeraKah-1/tb-conformal-triage/releases/download/v2.0.0-distilled/TB_Triage_Portable_Offline_Bundle.zip)
[![Baseline: v1.0.0-researchsquare](https://img.shields.io/badge/Baseline-v1.0.0--researchsquare-0284C7.svg?style=flat-square)](https://github.com/SeraKah-1/tb-conformal-triage/tree/v1.0.0-researchsquare)
[![DOI: Paper 1 (Research Square)](https://img.shields.io/badge/DOI-10.21203%2Frs.3.rs--11034929%2Fv1-blue.svg?style=flat-square)](https://doi.org/10.21203/rs.3.rs-11034929/v1)
[![Paper 2: medRxiv Priority Locked](https://img.shields.io/badge/medRxiv-Submitted%20(BioMedCLIP%20Distillation)-B31B1B.svg?style=flat-square)](https://www.medrxiv.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg?style=flat-square)](https://www.python.org/downloads/)
[![Weights v11: Kaggle](https://img.shields.io/badge/Kaggle-Model%20Weights%20v11-20BEFF.svg?style=flat-square)](https://www.kaggle.com/datasets/mfarreladitya/tb-distilled-conformal-model-weights)
[![Weights v9: Kaggle](https://img.shields.io/badge/Kaggle-Baseline%20Weights%20v9-grey.svg?style=flat-square)](https://www.kaggle.com/datasets/mfarreladitya/tb-conformal-model-v9-weights)

---

<div align="center">

### Clinical Screening Workstation Quick Launch

<a href="https://huggingface.co/spaces/Ressshh/tb-conformal-triage-workstation">
  <img src="https://img.shields.io/badge/%F0%9F%8C%90_LAUNCH_WEB_WORKSTATION-(FREE_%26_IN--BROWSER_WASM)-2563EB?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Launch Web Workstation" height="42">
</a>
&nbsp;&nbsp;
<a href="https://github.com/SeraKah-1/tb-conformal-triage/releases/download/v2.0.0-distilled/TB_Triage_Portable_Offline_Bundle.zip">
  <img src="https://img.shields.io/badge/%E2%AC%87%EF%B8%8F_DOWNLOAD_OFFLINE_USB_BUNDLE-(32.8_MB_ZIP)-059669?style=for-the-badge&logo=windows&logoColor=white" alt="Download Offline USB Bundle" height="42">
</a>

<br><br>

| Path A: In-Browser PWA (Zero Setup) | Path B: Air-Gapped USB Flash Drive (Offline Facilities) |
| :--- | :--- |
| **Step 1:** Open the Web Workstation via Chrome, Edge, or any modern browser.<br>**Step 2:** Click *"Install Application"* on screen or in the browser URL bar.<br>**Step 3:** Launch directly from your Desktop icon. Model weights (26.9 MB) cache locally for permanent offline execution. | **Step 1:** Click the green button above to download the offline ZIP package (32.8 MB).<br>**Step 2:** Extract the archive directly onto a portable USB drive.<br>**Step 3:** Connect to the target clinical PC and double-click `buka_aplikasi_offline.bat` (Windows) or execute `buka_aplikasi_offline.sh` (Linux). |

</div>

> [!NOTE]
> Detailed Indonesian deployment instructions for primary healthcare centers (Puskesmas) are maintained in [docs/PANDUAN_PUSKESMAS_ID.md](docs/PANDUAN_PUSKESMAS_ID.md).

---

## Executive Summary & Two-Stage Scientific Lineage

Computer-aided detection (CAD) software for pulmonary tuberculosis (TB) on chest radiographs (CXRs) is endorsed by the World Health Organization (WHO) to address diagnostic shortages in resource-constrained regions. However, standard deep learning classifiers deployed with uncalibrated softmax scoring exhibit overconfidence under sensor hardware variations, acquisition artifacts, and compression noise, introducing severe risks of silent false-negative triage errors.

This repository provides the open-source implementation, serialized model weights, offline WebAssembly Progressive Web App (PWA) workstation, and reproducibility pipeline for a coordinated two-stage scientific research program:

* **Stage 1 (Paper 1: Baseline Conformal Safety Architecture):**  
  *"Selective Conformal AI Architecture for Tuberculosis Triage: Mitigating Sensor Shift and False-Negative Risks via Pre-Analytic Quality Assurance and Clinical Deferral Interlocks"*  
  Lead Investigator: M. Farrel Aditya (Faculty of Medicine, Universitas Riau, Pekanbaru, Indonesia)  
  Preprint: [Research Square (2026)](https://doi.org/10.21203/rs.3.rs-11034929/v1) | DOI: `10.21203/rs.3.rs-11034929/v1`  
  Target Journal: *Biomedical Signal Processing and Control* (Elsevier, Scopus Q1, IF 5.1).

* **Stage 2 (Paper 2: BioMedCLIP Tri-Loss Distillation):**  
  *"Distilling Multimodal Biomedical Foundation Models for Edge Tuberculosis Screening: Client-Side WebAssembly Deployment and Conformal Clinical Abstention"*  
  Lead Investigator: M. Farrel Aditya (Faculty of Medicine, Universitas Riau, Pekanbaru, Indonesia)  
  Preprint: medRxiv (Submitted / Priority Locked)  
  Target Journal: *Computers in Biology and Medicine* (Elsevier, Scopus Top Q1, IF 7.7).

---

## Dual-Release Architecture & Benchmark Comparison

To preserve peer-review reproducibility for Paper 1 while providing the complete artifacts for Paper 2, this repository implements a **Dual-Release Architecture**:

* **Tag `v1.0.0-researchsquare` (Paper 1 Frozen Baseline):** Retains Model v9 (DenseNet-121 Supervised Baseline, 28.45 MB) matching the submitted manuscript bit-for-bit.
* **Main Branch `v2.0.0-distilled` (Paper 2 Distilled Release):** Provides Model v11 (BioMedCLIP Tri-Loss Distilled Student, 26.90 MB ONNX / 30.15 MB PyTorch) via a unified factory loader.

### Head-to-Head Empirical Benchmark: Model v9 vs Model v11

| External Evaluation Cohort | Sample Size (N) | Baseline DenseNet-121 (Model v9) | Distilled BioMedCLIP (Model v11) | Performance Delta (Delta AUROC) | Statistical Significance (Paired DeLong) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **India Solan (Rural CR Scanner)** | 155 | 0.8613 [0.802 - 0.921] | **0.9449 [0.909 - 0.981]** | **+0.0836** [+0.043, +0.124] | Z = +4.02, p = 5.928e-05 |
| **NITRD New Delhi (Tertiary DR Scanner)** | 278 | 0.8718 [0.829 - 0.915] | **0.9520 [0.927 - 0.977]** | **+0.0802** [+0.045, +0.116] | Z = +4.45, p = 8.567e-06 |
| **Combined India (Pooled External)** | 433 | 0.8635 [0.828 - 0.899] | **0.9497 [0.929 - 0.970]** | **+0.0862** [+0.059, +0.114] | Z = +6.17, p = 6.951e-10 |
| **Pakistan (JPEG Artifact Stress)** | 3,008 | 0.4990 [0.498 - 0.500] | **0.8624 [0.848 - 0.877]** | **+0.3634** [+0.349, +0.378] | Z = +49.34, p = 0.000e+00 |
| **South Asia Pooled Total** | 3,441 | 0.6289 [0.611 - 0.647] | **0.8658 [0.853 - 0.878]** | **+0.2369** [+0.222, +0.252] | Z = +31.17, p = 2.558e-213 |
| **Pakistan Singleton Resolution** | 3,008 | 0.0% (Decision Deficit) | **88.3% (Definitive Set)** | **+88.3% Resolution** | 90.2% Conformal Coverage |
| **CPU Execution Latency** | - | 343.8 ms (PyTorch CPU) | **77.5 ms (ONNX WASM SIMD)** | **4.4x Faster** | 12.90 Frames Per Second |

---

## Scientific Provenance: Retention of Baseline Model v9

Retaining the baseline logs and weights of Model v9 alongside Model v11 is an intentional methodological protocol adhering to STARD-AI, TRIPOD+AI, and ICMJE standards:

1. **Independent Reviewer Reproducibility:** Reviewers evaluating Paper 1 at *Biomedical Signal Processing and Control* can verify the exact numerical outputs (India AUROC 0.8682, weights SHA-256 `d461fe07...`) reported in the submitted manuscript.
2. **Direct Ablation Comparison:** Retaining the baseline demonstrates the empirical effect of distilling a multimodal biomedical foundation model (BioMedCLIP) into a lightweight vision student under identical test splits.
3. **Methodological Transparency:** Disclosing baseline degradation under high compression (Pakistan dataset AUROC 0.4990, chance level) documents a known failure mode and confirms that Model v11 resolves this sensitivity (AUROC 0.8624).

---

## Offline Clinical Workstation (PWA & USB Portable Bundle)

To address operational challenges in rural clinics and decentralized facilities with limited or absent network connectivity, the workstation is deployed as an **offline Progressive Web App (PWA)** executing entirely in client-side RAM via WebAssembly SIMD.

```
+-----------------------------------------------------------------------------------------+
| [!] REGULATORY NOTICE: INVESTIGATIONAL SaMD (WHO CAD TPP / CLASS B)                    |
| This software is designed for automated clinical triage and screening risk-stratification.|
| It is NOT a standalone diagnostic instrument. All flagged suspect cases must be         |
| confirmed via clinical radiologist review or rapid molecular testing (Xpert MTB/RIF).  |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   +--------------------------+  +--------------------------+  +---------------------+   |
|   | 1. Image Ingestion       |  | 2. Edge Pre-Analytic QA  |  | 3. WASM SIMD Engine |   |
|   | Drag & drop CXR file     |->| Exposure & frequency     |->| ONNX Runtime Web    |   |
|   | (PNG, JPEG, DICOM-export)|  | DCT artifact audit       |  | 77.5 ms CPU forward |   |
|   +--------------------------+  +--------------------------+  +---------------------+   |
|                                                                            |            |
|   +--------------------------+  +--------------------------+               v            |
|   | 5. Explainable Heatmap   |  | 4. Conformal Interlock   |  <------------+            |
|   | HiResCAM 16x16 gradient  |<-| Calibrated P(TB) score   |                            |
|   | localization overlay     |  | Safe set: Non-TB / Defer |                            |
|   +--------------------------+  +--------------------------+                            |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

### Technical Highlights

* **Direct Download (Offline USB Bundle):** [TB_Triage_Portable_Offline_Bundle.zip (32.8 MB)](https://github.com/SeraKah-1/tb-conformal-triage/releases/download/v2.0.0-distilled/TB_Triage_Portable_Offline_Bundle.zip)
* **Live In-Browser Workstation:** [Hugging Face Space (Ressshh/tb-conformal-triage-workstation)](https://huggingface.co/spaces/Ressshh/tb-conformal-triage-workstation)
* **Zero External Dependencies:** All runtime libraries (`ort.min.js`, `ort-wasm-simd.wasm`, KaTeX CSS and WOFF2 fonts) are bundled locally in `./vendor/`.
* **Air-Gapped Cache:** Service Worker (`sw.js`) stores the 26.9 MB ONNX model directly inside browser Cache storage for permanent offline execution.
* **Zero Network Latency:** Bypasses remote server calls entirely. Forward passes execute on the local CPU via WebAssembly SIMD (77.5 ms per radiograph).
* **Clinical Data Privacy:** Radiographs never leave client volatile memory. Designed to align with healthcare privacy standards (such as Indonesian UU PDP No. 27/2022, Permenkes No. 24/2022, and HIPAA de-identification guidelines).
* **Portable USB Bundle:** Self-contained archive (`TB_Triage_Portable_Offline_Bundle.zip`, 32.8 MB) with one-click launcher scripts (`buka_aplikasi_offline.bat` for Windows and `buka_aplikasi_offline.sh` for Linux) for zero-internet facilities.

---

## Quickstart: Python Unified Modular Factory

The package provides a unified factory function to instantiate either model version:

```python
from tb_conformal_triage import create_triage_engine
from PIL import Image

# 1. Instantiate Paper 2 Distilled Engine (Default, Model v11)
engine_v11 = create_triage_engine(model_version="v11_distilled", device="cpu")

# 2. Instantiate Paper 1 Baseline Engine (Model v9)
engine_v9 = create_triage_engine(model_version="v9_baseline", device="cpu")

# 3. Execute Triage Inference on Chest Radiograph
img = Image.open("assets/normal_healthy_case.png")
result = engine_v11.triage_image(img, filename="sample.png", generate_heatmap=True)

print("Triage Action:", result["triage_action"])
print("Calibrated P(TB):", result["probability_tb"])
print("Conformal Set:", result["conformal_details"]["conformal_set"])
print("HiResCAM Heatmap Available:", result["hirescam_heatmap_base64"] is not None)
```

---

## Repository Structure

```
tb-conformal-triage/
├── src/tb_conformal_triage/         # Core Python package
│   ├── __init__.py                  # Version 2.0.0 exports
│   ├── model.py                     # Dual architecture (v9 & v11) and create_triage_engine factory
│   ├── iqa.py                       # Pre-analytic Input Quality Assurance & DCT analysis
│   ├── ood.py                       # Mahalanobis Out-of-Distribution detector
│   └── schemas.py                   # Pydantic data schemas
├── assets/                          # HiResCAM visual examples and STARD-AI flow diagram
├── configs/                         # Model configuration files
├── docs/                            # Documentation and checklists
│   └── PANDUAN_PUSKESMAS_ID.md      # Field deployment guide for Indonesian primary health centers
├── notebooks/                       # End-to-end evaluation and DeLong test pipeline
│   └── main_pipeline.py             # Reproducibility script
├── tb_pwa_offline_workstation/      # Offline Clinical PWA Workstation
│   ├── index.html                   # Bento Grid clinical workstation interface
│   ├── manifest.json                # PWA standalone manifest
│   ├── sw.js                        # Cache-First Service Worker
│   ├── models/                      # Model v11 ONNX (tb_conformal_distilled_v11_cam.onnx)
│   ├── vendor/                      # Bundled ONNX WASM & KaTeX fonts (Zero CDN)
│   ├── static/                      # Modular CSS and JS controllers
│   ├── buka_aplikasi_offline.bat    # Windows portable launcher
│   └── buka_aplikasi_offline.sh     # Linux portable launcher
├── CITATION.cff                     # Citation metadata with Research Square DOI
├── LICENSE                          # MIT License
├── requirements.txt                 # Minimum Python dependencies
└── README.md                        # Master documentation
```

---

## Citation & Academic Attribution

If you utilize this safety architecture, the BioMedCLIP distillation framework, or the offline PWA workstation in your research, please cite the corresponding preprints:

### Stage 1 (Baseline Safety Architecture):
```bibtex
@article{aditya2026selective,
  title={Selective Conformal AI Architecture for Tuberculosis Triage: Mitigating Sensor Shift and False-Negative Risks via Pre-Analytic Quality Assurance and Clinical Deferral Interlocks},
  author={Aditya, M. Farrel},
  journal={Research Square Preprint},
  year={2026},
  doi={10.21203/rs.3.rs-11034929/v1},
  url={https://doi.org/10.21203/rs.3.rs-11034929/v1}
}
```

### Stage 2 (BioMedCLIP Distillation):
```bibtex
@article{aditya2026distilling,
  title={Distilling Multimodal Biomedical Foundation Models for Edge Tuberculosis Screening: Client-Side WebAssembly Deployment and Conformal Clinical Abstention},
  author={Aditya, M. Farrel},
  journal={medRxiv Preprint},
  year={2026},
  note={Submitted / Priority Locked}
}
```

---

## License

This project is licensed under the terms of the MIT License. See [LICENSE](LICENSE) for details.
