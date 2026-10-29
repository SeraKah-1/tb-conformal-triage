# Independent real-browser verification

Executed Chromium with Playwright, real bundled ONNX/WASM, and local Node server. The reference-corruption check is deliberate browser fault injection. No clinical accuracy, cohort reproducibility, or low-end hardware claims follow from these smoke fixtures.

Command: `python tests/browser_smoke.py`

```json
{
  "checks": [
    {
      "name": "unrelated CacheStorage survives activation",
      "passed": true,
      "details": null
    },
    {
      "name": "first offline reload loads query-versioned scripts",
      "passed": true,
      "details": null
    },
    {
      "name": "real offline WASM result: india_solan_normal_control.png",
      "passed": true,
      "details": {
        "filename": "india_solan_normal_control.png",
        "action": "ASSISTIVE_NORMAL_DOCTOR_VERIFY",
        "probability_tb": 0.002814711830237473,
        "allow": false,
        "interlock": true,
        "ood": {
          "status": "in_distribution",
          "available": true,
          "mahalanobis_distance": 21.667704282357647,
          "distance_to_normal": 21.667704282357647,
          "distance_to_tb": 71.50196497364978,
          "threshold": 41.94,
          "is_ood": false,
          "warning": null
        },
        "latency_ms": 2197,
        "banner": "Pemeriksaan Pasien Baru\nVERIFIKASI DOKTER WAJIB\nSkor model rendah - hasil asistif\nSkor model rendah dengan singleton Normal. Verifikasi dokter tetap wajib; tidak ada pelepasan pasien otomatis.\nPeta Deteksi Lesi Paru\nArea Curiga TB\nFoto Asli\nBagi Dua (Geser)\nSorot Bercak\n< Foto Rontgen Asli (Anatomi)\nArea Curiga TB (Warna) >\nTingkat Risiko TB\n0.28%\nSkor model; dokter menentukan pemeriksaan dan tindak lanjut.\nSkor Model Non-TB\n99.72%\nSkor model tidak memastikan paru sehat atau menyingkirkan TB.\nRincian Teknis & Audit Regulasi AI (Untuk Dokter & Auditor)\n+"
      }
    },
    {
      "name": "clinician verification required: india_solan_normal_control.png",
      "passed": true,
      "details": null
    },
    {
      "name": "real OOD computed: india_solan_normal_control.png",
      "passed": true,
      "details": null
    },
    {
      "name": "real offline WASM result: india_solan_active_tb.png",
      "passed": true,
      "details": {
        "filename": "india_solan_active_tb.png",
        "action": "AUTO_FLAG_TB_URGENT",
        "probability_tb": 0.686857157158334,
        "allow": false,
        "interlock": true,
        "ood": {
          "status": "in_distribution",
          "available": true,
          "mahalanobis_distance": 28.50035323384401,
          "distance_to_normal": 62.154708079440674,
          "distance_to_tb": 28.50035323384401,
          "threshold": 41.94,
          "is_ood": false,
          "warning": null
        },
        "latency_ms": 1709,
        "banner": "Pemeriksaan Pasien Baru\nRISIKO TINGGI (CURIGA TB PARU)\nPERHATIAN: Dicurigai Kuat Terdapat TB Paru Aktif\nDugaan TB: prioritaskan telaah dokter dan konfirmasi molekuler sesuai protokol klinis. Hasil AI bukan diagnosis.\nPeta Deteksi Lesi Paru\nArea Curiga TB\nFoto Asli\nBagi Dua (Geser)\nSorot Bercak\n< Foto Rontgen Asli (Anatomi)\nArea Curiga TB (Warna) >\nTingkat Risiko TB\n68.69%\nSkor model; dokter menentukan pemeriksaan dan tindak lanjut.\nSkor Model Non-TB\n31.31%\nSkor model tidak memastikan paru sehat atau menyingkirkan TB.\nRincian Teknis & Audit Regulasi AI (Untuk Dokter & Auditor)\n+"
      }
    },
    {
      "name": "clinician verification required: india_solan_active_tb.png",
      "passed": true,
      "details": null
    },
    {
      "name": "real OOD computed: india_solan_active_tb.png",
      "passed": true,
      "details": null
    },
    {
      "name": "real offline WASM result: nitrd_apical_tb.png",
      "passed": true,
      "details": {
        "filename": "nitrd_apical_tb.png",
        "action": "REFER_AMBIGUOUS_TO_DOCTOR",
        "probability_tb": 0.35627148649332563,
        "allow": false,
        "interlock": true,
        "ood": {
          "status": "in_distribution",
          "available": true,
          "mahalanobis_distance": 34.78434913614907,
          "distance_to_normal": 54.30592670268227,
          "distance_to_tb": 34.78434913614907,
          "threshold": 41.94,
          "is_ood": false,
          "warning": null
        },
        "latency_ms": 1618,
        "banner": "Pemeriksaan Pasien Baru\nPERLU PEMERIKSAAN DOKTER\nHASIL MERAGUKAN: Wajib Dievaluasi Dokter\nHasil model ambigu atau intermediate. Wajib telaah dokter; jangan gunakan hasil ini untuk melepas pasien.\nPeta Deteksi Lesi Paru\nArea Curiga TB\nFoto Asli\nBagi Dua (Geser)\nSorot Bercak\n< Foto Rontgen Asli (Anatomi)\nArea Curiga TB (Warna) >\nTingkat Risiko TB\n35.63%\nSkor model; dokter menentukan pemeriksaan dan tindak lanjut.\nSkor Model Non-TB\n64.37%\nSkor model tidak memastikan paru sehat atau menyingkirkan TB.\nRincian Teknis & Audit Regulasi AI (Untuk Dokter & Auditor)\n+"
      }
    },
    {
      "name": "clinician verification required: nitrd_apical_tb.png",
      "passed": true,
      "details": null
    },
    {
      "name": "real OOD computed: nitrd_apical_tb.png",
      "passed": true,
      "details": null
    },
    {
      "name": "safe probability captions survive language switch: en",
      "passed": true,
      "details": {
        "tb": "Model score; clinician determines testing and follow-up.",
        "normal": "Model score does not establish healthy lungs or exclude TB."
      }
    },
    {
      "name": "safe probability captions survive language switch: id",
      "passed": true,
      "details": {
        "tb": "Skor model; dokter menentukan pemeriksaan dan tindak lanjut.",
        "normal": "Skor model tidak memastikan paru sehat atau menyingkirkan TB."
      }
    },
    {
      "name": "invalid reference fails closed with unavailable UI",
      "passed": true,
      "details": {
        "action": "REFER_AMBIGUOUS_TO_DOCTOR",
        "ood": {
          "status": "unavailable",
          "available": false,
          "mahalanobis_distance": null,
          "distance_to_normal": null,
          "distance_to_tb": null,
          "threshold": null,
          "is_ood": null,
          "warning": "Pemeriksaan OOD tidak tersedia atau tidak valid. Wajib telaah dokter."
        },
        "text": "OOD UNAVAILABLE - CLINICIAN REVIEW REQUIRED"
      }
    },
    {
      "name": "changing patient discards in-flight old result",
      "passed": true,
      "details": {
        "oldDiscarded": true,
        "filename": "patient-B.png",
        "sourceMatchesPreview": true,
        "action": "AUTO_FLAG_TB_URGENT"
      }
    },
    {
      "name": "replacement patient result owns its preview",
      "passed": true,
      "details": {
        "oldDiscarded": true,
        "filename": "patient-B.png",
        "sourceMatchesPreview": true,
        "action": "AUTO_FLAG_TB_URGENT"
      }
    },
    {
      "name": "batch filename HTML inert",
      "passed": true,
      "details": {
        "results": [
          {
            "filename": "<img src=x onerror=\"window.filenameInjection=true\">.png",
            "action": "ASSISTIVE_NORMAL_DOCTOR_VERIFY",
            "probability": 0.002814711830237473
          },
          {
            "filename": "corrupt.png",
            "action": "REJECT_CORRUPT_IMAGE",
            "probability": null
          }
        ],
        "injected": false,
        "imgCount": 0,
        "text": "\n                1\n                <img src=x onerror=\"window.filenameInjection=true\">.png\n                Selesai\n                0.3%\n                ASSISTIVE_NORMAL_DOCTOR_VERIFY\n                1592 ms\n                \ud83d\udc41\ufe0f Buka Heatmap\n            \n                2\n                corrupt.png\n                Ditolak (Foto Rusak)\n                N/A\n                REJECT_CORRUPT_IMAGE\n                1615 ms\n                \ud83d\udc41\ufe0f Buka Heatmap\n            "
      }
    },
    {
      "name": "corrupt image has technical rejection without fake probability",
      "passed": true,
      "details": null
    },
    {
      "name": "runtime failure clears stale scores and OOD",
      "passed": true,
      "details": {
        "resultCleared": true,
        "tb": "N/A",
        "normal": "N/A",
        "action": "ERROR_RUNTIME",
        "ood": "UNAVAILABLE"
      }
    },
    {
      "name": "no unexpected page errors",
      "passed": true,
      "details": []
    },
    {
      "name": "no external requests for local offline workflow",
      "passed": true,
      "details": []
    }
  ],
  "sample_results": [
    {
      "filename": "india_solan_normal_control.png",
      "action": "ASSISTIVE_NORMAL_DOCTOR_VERIFY",
      "probability_tb": 0.002814711830237473,
      "allow": false,
      "interlock": true,
      "ood": {
        "status": "in_distribution",
        "available": true,
        "mahalanobis_distance": 21.667704282357647,
        "distance_to_normal": 21.667704282357647,
        "distance_to_tb": 71.50196497364978,
        "threshold": 41.94,
        "is_ood": false,
        "warning": null
      },
      "latency_ms": 2197,
      "banner": "Pemeriksaan Pasien Baru\nVERIFIKASI DOKTER WAJIB\nSkor model rendah - hasil asistif\nSkor model rendah dengan singleton Normal. Verifikasi dokter tetap wajib; tidak ada pelepasan pasien otomatis.\nPeta Deteksi Lesi Paru\nArea Curiga TB\nFoto Asli\nBagi Dua (Geser)\nSorot Bercak\n< Foto Rontgen Asli (Anatomi)\nArea Curiga TB (Warna) >\nTingkat Risiko TB\n0.28%\nSkor model; dokter menentukan pemeriksaan dan tindak lanjut.\nSkor Model Non-TB\n99.72%\nSkor model tidak memastikan paru sehat atau menyingkirkan TB.\nRincian Teknis & Audit Regulasi AI (Untuk Dokter & Auditor)\n+"
    },
    {
      "filename": "india_solan_active_tb.png",
      "action": "AUTO_FLAG_TB_URGENT",
      "probability_tb": 0.686857157158334,
      "allow": false,
      "interlock": true,
      "ood": {
        "status": "in_distribution",
        "available": true,
        "mahalanobis_distance": 28.50035323384401,
        "distance_to_normal": 62.154708079440674,
        "distance_to_tb": 28.50035323384401,
        "threshold": 41.94,
        "is_ood": false,
        "warning": null
      },
      "latency_ms": 1709,
      "banner": "Pemeriksaan Pasien Baru\nRISIKO TINGGI (CURIGA TB PARU)\nPERHATIAN: Dicurigai Kuat Terdapat TB Paru Aktif\nDugaan TB: prioritaskan telaah dokter dan konfirmasi molekuler sesuai protokol klinis. Hasil AI bukan diagnosis.\nPeta Deteksi Lesi Paru\nArea Curiga TB\nFoto Asli\nBagi Dua (Geser)\nSorot Bercak\n< Foto Rontgen Asli (Anatomi)\nArea Curiga TB (Warna) >\nTingkat Risiko TB\n68.69%\nSkor model; dokter menentukan pemeriksaan dan tindak lanjut.\nSkor Model Non-TB\n31.31%\nSkor model tidak memastikan paru sehat atau menyingkirkan TB.\nRincian Teknis & Audit Regulasi AI (Untuk Dokter & Auditor)\n+"
    },
    {
      "filename": "nitrd_apical_tb.png",
      "action": "REFER_AMBIGUOUS_TO_DOCTOR",
      "probability_tb": 0.35627148649332563,
      "allow": false,
      "interlock": true,
      "ood": {
        "status": "in_distribution",
        "available": true,
        "mahalanobis_distance": 34.78434913614907,
        "distance_to_normal": 54.30592670268227,
        "distance_to_tb": 34.78434913614907,
        "threshold": 41.94,
        "is_ood": false,
        "warning": null
      },
      "latency_ms": 1618,
      "banner": "Pemeriksaan Pasien Baru\nPERLU PEMERIKSAAN DOKTER\nHASIL MERAGUKAN: Wajib Dievaluasi Dokter\nHasil model ambigu atau intermediate. Wajib telaah dokter; jangan gunakan hasil ini untuk melepas pasien.\nPeta Deteksi Lesi Paru\nArea Curiga TB\nFoto Asli\nBagi Dua (Geser)\nSorot Bercak\n< Foto Rontgen Asli (Anatomi)\nArea Curiga TB (Warna) >\nTingkat Risiko TB\n35.63%\nSkor model; dokter menentukan pemeriksaan dan tindak lanjut.\nSkor Model Non-TB\n64.37%\nSkor model tidak memastikan paru sehat atau menyingkirkan TB.\nRincian Teknis & Audit Regulasi AI (Untuk Dokter & Auditor)\n+"
    }
  ],
  "page_errors": [],
  "external_requests": [],
  "browser": "154.0.8037.57"
}
```
