# Selective Conformal AI Architecture for Tuberculosis Triage
### Multi-Cohort Development, BioMedCLIP Distillation, and Independent External Stress-Testing

[![Release: v2.0.0-distilled](https://img.shields.io/badge/Release-v2.0.0--distilled-059669.svg)](https://github.com/SeraKah-1/tb-conformal-triage/releases)
[![Baseline: v1.0.0-researchsquare](https://img.shields.io/badge/Baseline-v1.0.0--researchsquare-0284C7.svg)](https://github.com/SeraKah-1/tb-conformal-triage/tree/v1.0.0-researchsquare)
[![DOI: Paper 1 (Research Square)](https://img.shields.io/badge/DOI-10.21203%2Frs.3.rs--11034929%2Fv1-blue.svg)](https://doi.org/10.21203/rs.3.rs-11034929/v1)
[![Paper 2: medRxiv Priority Locked](https://img.shields.io/badge/medRxiv-Submitted%20(BioMedCLIP%20Distillation)-B31B1B.svg)](https://www.medrxiv.org)
[![Offline PWA: 100% Air-Gapped](https://img.shields.io/badge/Workstation-100%25%20Offline%20PWA%20(27%20MB)-purple.svg)](https://github.com/SeraKah-1/tb-conformal-triage#offline-clinical-workstation-pwa--usb-portable-bundle)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Hardware: Dual Tesla T4](https://img.shields.io/badge/Hardware-Dual%20Tesla%20T4%20(sm__75)-76B900.svg)](https://www.nvidia.com)
[![Kaggle Dataset](https://img.shields.io/badge/Kaggle-Model%20Weights-20BEFF.svg)](https://www.kaggle.com/datasets/mfarreladitya/tb-conformal-model-v9-weights)

---

## Executive Summary & Two-Stage Scientific Lineage

Computer-aided detection (CAD) software for pulmonary tuberculosis (TB) on chest radiographs (CXRs) is endorsed by the World Health Organization (WHO) to address diagnostic shortages in high-burden regions. However, standard deep learning classifiers deployed with uncalibrated softmax scoring exhibit overconfidence under sensor hardware variations and acquisition artifacts, introducing severe risks of silent false-negative discharges.

This repository provides the open-source implementation, serialized model weights, offline PWA workstation, and reproducibility pipeline for a coordinated two-stage scientific research program:

* **Stage 1 (Paper 1 - Baseline Conformal Safety Architecture):**  
  *"Selective Conformal AI Architecture for Tuberculosis Triage: Mitigating Sensor Shift and False-Negative Risks via Pre-Analytic Quality Assurance and Clinical Deferral Interlocks"*  
  Lead Investigator: M. Farrel Aditya (Faculty of Medicine, Universitas Riau, Pekanbaru, Indonesia)  
  Preprint: [Research Square (2026)](https://doi.org/10.21203/rs.3.rs-11034929/v1) | DOI: `10.21203/rs.3.rs-11034929/v1`  
  Target Journal: *Biomedical Signal Processing and Control* (Elsevier, Scopus Q1, IF 5.1, $0 APC Subscription Track).

* **Stage 2 (Paper 2 - BioMedCLIP Tri-Loss Distillation Flagship):**  
  *"Distilling Multimodal Biomedical Foundation Models for Edge Tuberculosis Screening: Client-Side WebAssembly Deployment and Conformal Clinical Abstention"*  
  Lead Investigator: M. Farrel Aditya (Faculty of Medicine, Universitas Riau, Pekanbaru, Indonesia)  
  Preprint: medRxiv (Submitted / Priority Locked)  
  Target Journal: *Computers in Biology and Medicine* (Elsevier, Scopus Top Q1, IF 7.7, $0 APC Subscription Track).

---

## Dual-Model Lineage & Empirical Comparison (Model v9 vs Model v11)

To protect peer-review reproducibility for Paper 1 while delivering the breakthroughs of Paper 2, this repository implements a **Dual-Release Architecture**:

* **Tag `v1.0.0-researchsquare` (Paper 1 Frozen Baseline):** Retains Model v9 (DenseNet-121 Supervised Baseline, 28.45 MB) matching the submitted manuscript bit-for-bit.
* **Main Branch `v2.0.0-distilled` (Paper 2 Flagship Release):** Provides Model v11 (BioMedCLIP Tri-Loss Distilled Student, 26.90 MB ONNX / 30.15 MB PyTorch) via a clean, unified factory loader.

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

## Scientific Provenance: Why Baseline Log v9 is Formally Retained

Retaining the baseline logs of Model v9 alongside Model v11 is an intentional methodological requirement adhering to STARD-AI, TRIPOD+AI, and ICMJE standards:

1. **Independent Reviewer Reproducibility:** Reviewers evaluating Paper 1 at *Biomedical Signal Processing and Control* must be able to clone the repository and verify the exact numerical outputs (India AUROC 0.8682, weights SHA-256 `d461fe07...`) reported in the submitted manuscript.
2. **Quantification of the Distillation Leap (Before vs After):** Without the v9 log, Model v11's AUROC of 0.9497 on India and 0.8624 on Pakistan lacks comparative context. Prominently displaying the v9 baseline proves that the leap in performance is the direct result of BioMedCLIP multi-modal distillation, rather than arbitrary architectural tweaks.
3. **Transparency Against Salami-Slicing & Cherry-Picking:** Reporting the catastrophic failure of Model v9 on Pakistan compression noise (0.4990, pure coin flip) demonstrates scientific honesty. It establishes that Model v11 directly solved a documented technical failure mode.

---

## Offline Clinical Workstation (PWA & USB Portable Bundle)

To solve the real-world operational challenges of rural community health centers (Puskesmas) in Indonesia (unstable 3G modems, power outages, and zero GPU infrastructure), the workstation is engineered as an **offline Progressive Web App (PWA)** that runs 100% in-browser RAM via WebAssembly SIMD.

### Visual Architecture: One-Click Offline Installation ("Tombol Paling Gede")

```
+--------------------------------------------------------------------------------------------------+
| [!] PERINGATAN REGULATORI SaMD (KEMENKES RI / WHO CAD TPP):                                     |
| Software as a Medical Device (SaMD) Kelas B. Sistem ini dirancang untuk triase terarah,         |
| BUKAN penegak diagnosis mutlak. Seluruh temuan wajib dikonfirmasi radiolog atau uji TCM GeneXpert.|
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   ############################################################################################   |
|   #                                                                                          #   |
|   #   [📥]  PASANG APLIKASI TRIASE TB OFFLINE KE KOMPUTER INI (27 MB)                        #   |
|   #         Klik Sekali Di Sini - Langsung Jadi Ikon Desktop - 100% Berjalan Tanpa Internet   #   |
|   #                                                                                          #   |
|   ############################################################################################   |
|                                                                                                  |
|   +--------------------------+  +--------------------------+  +--------------------------+       |
|   |  LANGKAH 1               |  |  LANGKAH 2               |  |  LANGKAH 3               |       |
|   |  [ 1. KLIK TOMBOL BESAR ]|  |  [ 2. BUKA DARI DESKTOP ]|  |  [ 3. SERET FOTO RONTGEN ]|       |
|   |  Pilih "Install / Pasang"|  |  Klik ikon TB Conformal |  |  Tarik file CXR ke layar, |       |
|   |  pada pop-up browser     |  |  yang muncul di Desktop  |  |  hasil keluar 0.1 detik  |       |
|   +--------------------------+  +--------------------------+  +--------------------------+       |
|                                                                                                  |
|   --------------------------------------------------------------------------------------------   |
|   PILIHAN LAIN (UNTUK KOMPUTER PUSKESMAS TANPA KONEKSI INTERNET SAMA SEKALI):                    |
|   [ Unduh Paket Offline Flashdisk (ZIP 32.8 MB) ]   [ Peluncur Windows (.BAT) ]                  |
+--------------------------------------------------------------------------------------------------+
```

### Key Workstation Technical Highlights:
* **Zero CDN Dependencies:** All runtime libraries (`ort.min.js`, `ort-wasm-simd.wasm`, KaTeX CSS and WOFF2 fonts) are bundled locally in `./vendor/`.
* **Permanent Air-Gapped Cache:** Hardened Service Worker (`sw.js`) stores the 26.9 MB ONNX model directly inside the browser Cache API. Computers can be permanently disconnected from the internet after initial caching.
* **0 ms Network Latency:** Bypasses remote backend server polling completely. All inferences execute directly inside the client CPU via WebAssembly SIMD (77.5 ms per scan).
* **Clinical Data Privacy Compliance:** Complies with Indonesian Personal Data Protection Law (UU PDP No. 27/2022) and Permenkes No. 24/2022. Patient radiographs never leave volatile browser memory.
* **Portable USB Bundle:** Self-contained archive (`TB_Triage_Portable_Offline_Bundle.zip`, 32.8 MB) with one-click launcher scripts (`buka_aplikasi_offline.bat` for Windows and `buka_aplikasi_offline.sh` for Linux) for zero-internet facilities.

---

## Quickstart: Python Unified Modular Factory

The package provides a single entry point to instantiate either model engine cleanly:

```python
from tb_conformal_triage import create_triage_engine
from PIL import Image

# 1. Instantiate Paper 2 Flagship Distilled Engine (Default, Model v11)
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
├── docs/                            # Verification dossiers and reporting checklists
├── notebooks/                       # End-to-end evaluation and DeLong test pipeline
├── tb_pwa_offline_workstation/      # 100% Offline Clinical PWA Workstation
│   ├── index.html                   # Bento Grid clinical interface with Giant Install Button
│   ├── manifest.json                # PWA standalone manifest
│   ├── sw.js                        # Cache-First Service Worker
│   ├── models/                      # Model v11 ONNX (tb_conformal_distilled_v11_cam.onnx)
│   ├── vendor/                      # Bundled ONNX WASM & KaTeX fonts (Zero CDN)
│   ├── static/                      # Modular CSS and JS controllers
│   ├── buka_aplikasi_offline.bat    # One-click Windows portable launcher
│   └── buka_aplikasi_offline.sh     # One-click Linux portable launcher
├── CITATION.cff                     # Citation metadata with Research Square DOI
├── LICENSE                          # MIT License
├── requirements.txt                 # Minimum Python dependencies
└── README.md                        # Master documentation
```

---

## Citation & Academic Attribution

If you utilize this safety architecture, the BioMedCLIP distillation framework, or the offline PWA workstation in your research, please cite the corresponding studies:

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

### Stage 2 (BioMedCLIP Distillation Flagship):
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
