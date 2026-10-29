# PWA mechanism audit

The PWA executes IQA, class-conditional conformal set construction, and OOD scoring. This establishes software behavior; it does not establish validated clinical accuracy, 95% observed coverage, safe patient discharge, or thousand-image throughput. The deployed browser model remains the legacy v11 ONNX; it is not the new matched experiment currently running in Kaggle.

## Mechanisms and limits

| Mechanism | Actual browser implementation | What remains unproven |
| --- | --- | --- |
| IQA | Decodes image; checks dimensions, resolution, aspect ratio, grayscale contrast, saturation, blank-document heuristics, polarity, and native-patch block edges. Corrupt/blank inputs are rejected; quality advisories withhold assistive routing. | This is a heuristic screen, not a validated positioning/anatomy/diagnostic-quality classifier. It does not establish that a radiograph is adequate or that an arbitrary photograph is a chest radiograph. |
| Conformal | Stable temperature softmax with `T=2.1161616`; class-specific thresholds `q0=0.281667`, `q1=0.955110`; includes label y if `1-p_y <= q_y`. | These are hardcoded legacy calibration values. Historical temperature and quantiles were fitted on the same pool; exact patient/file separation from warm-start v9 training is unresolved. A Mondrian-style class-specific formula is present, but the desired finite-sample/clinical coverage guarantee is not established. |
| OOD | Minimum diagonal standardized distance to two 1024-dimensional class centroids; threshold41.94. Shape, finite values, positive scale, and finite distances are checked. Missing/invalid reference or latents yields unavailable and mandatory review. | Reference source IDs, clinical representativeness and exact model/preprocessing binding are not established by the JS parameter file. Its comment says100reference images; this is not a recovered manifest. An in-reference distance is not proof of a valid or safe clinical input. |
| Batch | New queue accepts multiple files and processes each sequentially using the real inference function. Technical failures have null scores. | No current benchmark establishes sustained processing of thousands of original-size images on low-end hardware. |
| Parallel | Legacy batch loop starts up to4asynchronous jobs against a shared ONNX session. The current queue is sequential. ONNX uses the WASM execution provider and `numThreads=1`. | Four promises are not four independent workers or GPU-parallel inference. The current implementation must not be described as true parallel inference. |

The Python OOD detector uses full inverse covariance; browser OOD uses diagonal scaling. Their distances and thresholds are not interchangeable. Browser preprocessing also includes grayscale windowing/polarity correction; old calibration provenance cannot be assumed to establish full Python/browser parity.

## Interpreting the legacy conformal thresholds

For binary `p=probability_tb`, Normal is included when `p <=0.281667`; TB is included when `p >=0.044890`. Therefore:

- Normal singleton requires `p <0.044890`, even though the assistive branch also checks `p <0.20`.
- Both labels appear from0.044890through0.281667, inclusive at the respective boundaries.
- TB singleton appears above0.281667.
- An empty set cannot occur for finite complementary probabilities with these particular thresholds. A generic empty-set filter is useful for other configurations, but should not fabricate empty cases here.

The exported predicted class uses0.4401, the high-score assistive flag uses0.65, and the low-score branch also depends on the conformal set and IQA/OOD. These are distinct rules. None permits autonomous release: `allow_autonomous_release=false` and the safety interlock remains engaged.

## Concrete IQA defect found and fixed

The native-patch blockiness computation originally classified boundary columns/rows relative to the crop rather than the original image. A center crop can start at an arbitrary offset from the native8-pixel grid. On identical synthetic global8-pixel block patterns, size512(crop128) scored10,000,000and was flagged; size514(crop129) scored0and was not flagged. Size528(crop136) was flagged again. This reproduced a false-negative advisory caused by crop alignment, not a model failure.

The implementation now tests boundary positions using `patchCropX + margin + x +1` and `patchCropY + margin + y +1`. Independent regression in `tests/iqa_alignment.test.js` tests aligned and offset crops and a smooth-gradient negative control. Both tests pass. Synthetic block patterns are mathematical fixtures, not validated compressed-radiograph accuracy measurements.

## Data presentation and thousand-image limits

Pagination can bound the number of DOM rows, and counts/filters can expose quality issues, OOD problems, ambiguous sets, flags and unreviewed cases. That reduces search/navigation effort. It does not reduce the medically required reviews by itself. A low-score group must not be auto-marked reviewed, auto-dismissed or silently excluded.

The implementation retains all case records in browser memory, creates a heatmap data URL for each processed image, and loads archived records via IndexedDB `getAll`. These features can consume substantial memory with large image collections. Unsaved queue/results are session-local; browser closure is not a durable processing checkpoint. Pagination therefore does not establish full thousand-image memory/throughput readiness.

For a validated high-volume workflow, further work would need measured throughput/peak memory, disk-backed resumable processing, bounded result/heatmap memory, and reviewed prioritization performance with explicit miss-risk denominators. The present functionality can organize batch work; it cannot promise that clinicians may safely skip most images.

## Verification performed

- `node --test tests/pwa_safety.test.js`:passed existing assistive policy, invalid logits, IQA gate, unavailable/malformed/OOD reference, patient identity race, escaping, and real model-byte checksum checks.
- `node --test tests/iqa_alignment.test.js`:2/2synthetic native-coordinate IQA checks passed after the alignment fix.
- `docs/audit/browser_verification.md` preserves earlier real-browser ONNX/WASM smoke evidence on bundled fixtures. This audit did not rerun heavy model inference or training locally.
- Historical calibration concerns are documented in `artifact_inventory.md`, `training_record_recovery.md` and `REMEDIATION_STATUS.md`.

No performance numbers, coverage measurements, or clinical validity claims were generated by this audit.
