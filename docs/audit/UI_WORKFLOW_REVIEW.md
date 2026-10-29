# Independent UI workflow review

The restored input-first UI passes **34 single-image browser assertions** and **39 batch/archive assertions**. The default page exposes image input and Process directly; queue, saved cases and guide remain secondary destinations. Tests use Chromium, actual FileReader/image decoding and real IndexedDB. Model inference is replaced by deterministic fixtures; no neural-network inference or training was executed.

Commands:

```bash
python tests/ui_single_browser.py
python tests/ui_workflow_browser.py
```

## Input-first behavior verified

- The initial page shows the single-image input and Process button, with the queue dashboard hidden. Process stays disabled until an image is selected.
- Selecting a real PNG and choosing Process shows its result in place, without switching to Batch. Successful, rejected and corrupt requests attach to the correct image record.
- Save preserves the image and note. Saved cases open without inference; returning to Check restores the original single-image input and result.
- Reprocessing the same selected File reuses its case ID and resets review status. A different File has a distinct case identity.
- Reset clears the displayed result and save controls. Deleting the active single case, or deleting its cached single snapshot from Batch, clears the old input/result when returning to Check. Selecting a new image while an earlier inference is pending prevents the late result from rendering or being captured under the new image.
- A request that completes after navigating to Batch is recorded without forcing navigation or opening a different case. Returning to Check restores that completed single result.
- Opening an archive invalidates a pending single-image render. Returning to Check before that request finishes does not restore an old score; after invalidation completes, an explicit empty state remains.
- IQA rejection avoids the model call. Runtime/corrupt errors clear prior probabilities. ID/EN switching retains the simple workflow; a390px viewport has no horizontal overflow.

## Issue found and resolved in this revision

Returning from Batch to Check before a pending single-image request completed initially hid the loading indicator and showed the unprocessed empty state while Process remained disabled. Existing-record reruns could also restore their earlier result during the pending request. The implementation now restores the active loading state and suppresses old results for both first processing and reruns. A finally-path empty-state fallback prevents a blank panel after an invalidated request. The new regression verifies all three transitions.

## Batch/archive behavior retained

The39-assertion suite explicitly opens Batch from the input-first landing page. It verifies duplicate filenames with distinct IDs, processing, separate saved/review states, reviewed filtering, newest sorting, unreviewed-first ordering, search, real save/reload, notes, ID/EN persistence, CSV formula escaping, stale-score clearing, cancellation, dirty-navigation cancellation, deletion and unsupported archive handling. Simulated storage failure does not claim a successful save.

The first-run notice exposes ID/EN before acceptance, wraps Tab focus while Continue is disabled, and returns focus to the visible single-image input after acceptance. No JavaScript page errors occurred in either suite.

## Earlier issue retained as a regression

The earlier dashboard revision overflowed at390px because the metadata grid contained long unbroken tokens. The grid uses bounded columns and wrapping; the current batch and single suites still verify narrow-screen document width.

## Boundaries

These suites block service workers to isolate UI state/storage. Separate offline tests cover cache behavior. They do not establish clinical accuracy, real inference throughput, screen-reader output, exhaustive keyboard compatibility, native print-dialog behavior or true disk-capacity limits. Quality and model results in the single test are controlled fixtures; this is a workflow test, not a calibration or diagnostic study. Pagination and large synthetic record tests do not establish capacity for thousands of original-size radiographs on low-end hardware.
