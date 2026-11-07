# Runtime and processing audit — 7 November 2026

Status: implementation candidate, not deployed. Production remains 4.8.6. No training, model weights, temperature, conformal quantiles, OOD reference or score thresholds changed in this work.

## Architecture implemented

UI → shared initialization promise → bounded request queue → dedicated worker → ONNX WASM session.

The UI owns progress and case state. A worker owns one ONNX session. Requests have IDs; stale responses cannot complete another request. Runs are serialized within a session rather than launching competing copies of the model. Capable isolated browsers request up to four threads (half the reported logical cores); single-thread execution is the fallback when isolation/assets are unavailable or threaded initialization fails. This is a resource policy, not a measured optimal thread count. Keeping inference in a worker also applies to single-thread fallback.

Both legacy batch entry points now delegate to the case workspace. The old four-job path no longer competes with the workspace queue. A session initialization promise replaces polling of a global loading flag. Fatal runtime failures close the worker, reject its requests, and allow a fresh session on explicit retry. There is no automatic repetition of a whole batch.

## Findings and disposition

| Finding | Effect | Disposition |
| --- | --- | --- |
| Fixed single-thread ONNX on UI thread | Strong devices underused; inference could delay UI input | Dedicated worker plus capability-based WASM threads implemented; GPU still unavailable |
| Two batch execution paths | Divergent configuration, concurrency and recovery behavior | Legacy entry points delegate to the same case queue |
| Polling initialization flag | Failure could strand callers | One shared promise; loading reset in finally; retry tested |
| Worker failure/stalled request | Pending promises and spinner could remain alive | Terminating timeouts (180 s init/run), crash handling, request IDs and bounded queue |
| Runtime failure repeated per batch image | Hundreds of attempts/timeouts after a device-wide failure | Stop batch, keep completed results and remaining pending cases; explicit retry |
| Blocked model-cache database | Cache optimization could prevent inference | Five-second cache deadline, blocked/error fallback, connections closed |
| Unbounded image read/decode promises | Stuck decode stage | Shared 60-second deadlines; handlers cleared, reader aborted/source released on timeout |
| Stalled model download | Endless prepare/download state | Abort after 60 s with no received chunk; progress uses bytes; streamed payload capped at 32 MiB |
| Unlimited accumulated image files | Memory exhaustion on large batches | Atomic admission: 2,000 cases, 16 MiB each, 256 MiB source total. Not a guarantee that 2,000 real cases fit memory |
| Runtime provenance absent from results | Impossible to tell actual execution path | Successful results record worker/threads/fallback; progress can show actual CPU thread count |
| Stage/count display could imply completion after error | User cannot tell what remains | Existing real-stage progress retained; fatal batch stop finishes as attention with actual counts |
| Relative WASM path in previous proxy test | Worker resolved asset path incorrectly | Absolute runtime/WASM URLs; failed experiment retained |
| Golden-image test path assumed a directory layout | Remote parity test failed before numerical comparisons | Hash-checked filename lookup across attached inputs; failed v1 retained |
| Automatic WebGPU use not supported by shipped runtime | GPU presence alone does not help | OPEN: separate WebGPU bundle/provider/operator testing and device-loss fallback required; no GPU speed claim |
| Decoding, IQA, preprocessing, DICOM and heatmap still use main-thread code | Long tasks remain possible outside inference | OPEN: profile stage-specific long tasks, then migrate measured expensive work with unchanged preprocessing/golden checks |
| Source-byte budget excludes decoded pixels, CAM/base64 and archives | Guard does not bound all browser memory | OPEN: lazy archive/image loading, per-stage decoded budget, storage-backed batches and large real-device soak tests |
| Fixed model/calibration constants scattered through app | Wrong model/reference combination or silent drift possible | OPEN: one hash-bound model manifest with preprocessing/temperature/quantiles/reference provenance; do not retune from UI anecdotes |
| Legacy IQA thresholds lack labeled quality calibration | Excess advisories and unclear meaning | OPEN: labeled acceptable/unacceptable images and separate failure/review metrics; preserve technical decode failures independently of switches |
| Heatmap alpha/taper choices are presentation heuristics | Visualization may imply localization beyond evidence | OPEN: separate display settings from inference and validate against localization annotations |
| Cancellation waits for current image | Cancel is not immediate abort | Explicit waiting message; queued cases become cancelled. OPEN: per-run cancellation tokens if immediate worker abort is required |
| Duplicate helpers/old DOM remain in app.js | Maintenance and unreachable-path risk | Main competing batch loop removed; full dead-code inventory/removal still pending, not claimed complete |
| Single-device browser tests | Does not establish desktop/mobile performance or memory behavior | OPEN: physical low/mid/high CPU and GPU device matrix with timings and memory/long-task observations |

## Verification scope

- Unit checks: worker crash, timeout, stale response IDs, queue bound, serialization, threaded initialization fallback.
- Browser checks: shared initialization, retry, fatal-batch stop, atomic admission, actual progress/counts, per-run settings, heatmap/slider behavior and pagination.
- Browser lifecycle/UI checks use stubs. They are not measurements of model accuracy or inference speed.
- Kaggle private kernel `mfarreladitya/tb-runtime-structural-20261107`: production v11 ONNX SHA `3f99751804bdd240ab3bea6b708456c51270acca6eeb71e659243ece0cd92592`; 13 fixed tensors; Python ORT versus browser worker WASM; at most 26 inference calls, zero training epochs. v1 initialized a 2-thread worker but failed on a missing golden-image path. v2 COMPLETE: 13/13 inputs passed all logits/CAM/latent comparisons with atol=rtol=1e-3. Browser selected 2 threads on 4 reported logical cores. Summary: `/workspace/audit-tb/runtime-structural-20261107/output-v2/wasm_parity/summary.json`. Comparison does not validate browser image preprocessing or clinical performance.
- Failed snapshots and outputs: `/workspace/audit-tb/runtime-structural-20261107/` and `/workspace/audit-tb/runtime-worker-20261106/`.

## Release gate

Do not replace the downloadable 4.8.6 ZIP or deploy this candidate under the old service-worker cache version. Require remote numeric parity, browser recovery/control tests, matching packaged worker/WASM assets and a new cache/release ID. GPU support, calibration validation and real-device throughput remain separate gates. No claim of "all edge cases eliminated" is supported.

## Technical references

- ONNX Runtime Web environment flags: https://onnxruntime.ai/docs/tutorials/web/env-flags-and-session-options.html (WASM threading/isolation, execution providers).
- ONNX Runtime Web deployment: https://onnxruntime.ai/docs/tutorials/web/deploy.html (runtime and WASM asset compatibility).
- Web Workers: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers (worker ownership/message passing, separate thread).
- AbortController: https://developer.mozilla.org/en-US/docs/Web/API/AbortController (abort fetch/body consumption).
- Storage limits: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria (browser/device-dependent quotas and eviction).

These document API behavior, not clinical thresholds or proof of faster execution on an untested device.

## Additional regression findings

Four old assertions still expected disabled/missing conformal checks to erase a valid low numeric score or force an intermediate category. Those assertions contradicted the already-authorized 4.8.2–4.8.6 separation of numeric score and review evidence. Updated assertions preserve the score while requiring unavailable/disabled checks to remain explicit; all 30 unit checks pass. The offline test also deleted an asset from an obsolete 4.8.5 cache. It now targets the declared current cache, so deleting a required asset actually tests readiness.

Runtime failures now display Failed/Gagal rather than Image issue/Masalah gambar; the progress card reports Some failed/Ada kegagalan, not clinical review. Source code and offline candidate use the new cache ID 4.8.7-runtime.

## Verification completed in this turn

30 unit assertions; 11 browser lifecycle/recovery/admission checks; 23 progress checks; 9 captured-settings/DICOM-provenance checks; 37 visual controls/pointer checks; 8 heatmap-generation checks; 18 synthetic 1,001-case checks; 8 real-service-worker offline checks. These are 144 checks across the listed suites, with mocked model sessions for browser UI tests. Kaggle adds 13 same-tensor numerical comparisons, not 13 clinical cases.

The new offline candidate is `/workspace/audit-tb/runtime-structural-20261107/TB_Review_Offline_4.8.7_candidate.zip`; it does not replace the public 4.8.6 download. GPU enablement, full preprocessing migration, data-derived thresholds, real-device speed/memory tests and full dead-code cleanup remain open. Suspended/background browser tabs can delay processing and timers; a device-level soak test remains necessary. Native Windows BAT execution has not been tested in this Linux workspace.
