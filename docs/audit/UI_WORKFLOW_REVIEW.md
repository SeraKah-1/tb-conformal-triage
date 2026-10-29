# Independent UI workflow review

The new case workflow passes **38 browser assertions** in `python tests/ui_workflow_browser.py`. The test uses Chromium and real IndexedDB, with model inference replaced by deterministic fixtures. It does not run a neural network, train a model, or establish clinical accuracy.

## Issue found and resolved

At a390px viewport, the legacy metadata grid overflowed to430.5px when a saved case was opened. The action and latency cells were the offending elements. The UI implementer changed grid columns to `minmax(0,1fr)`, added wrapping, and used a single column on narrow screens. The independent regression now passes with no horizontal document overflow.

## Verified behavior

- Four files, including two with the same filename, receive four distinct case IDs. New cases are unsaved and unreviewed.
- Processing completes; detail opens the selected case. Review status and saved status are separate.
- Reviewed filtering, newest sorting, unreviewed-first ordering, and filename search work.
- Notes and review status survive an actual IndexedDB save and page reload. Opening an archive does not invoke model inference.
- Switching ID/EN preserves notes. English preference survives reload. Changing language during processing preserves both the queue and the active process.
- CSV neutralizes filename and note spreadsheet formulas. Failed runtime and corrupt-image results clear old probability displays.
- Dirty navigation can be cancelled. Confirmed deletion removes the stored case.
- Processing is sequential. Cancellation preserves the completed case and marks the remaining case cancelled.
- Simulated browser storage failure does not claim a successful save. Unsupported archive schema versions are skipped with a visible message.
- Mobile detail does not overflow horizontally after the fix. No JavaScript page errors occurred during this suite.
- Empty Export is disabled. Opening a detail focuses its heading. The first-run notice focuses its language button, switches to English, wraps Tab past disabled Continue, and returns focus to the workspace after acceptance.

The suite was rerun after icon, focus, collapsible-model metadata, and first-run dialog changes; all38assertions passed. Static inspection found no critical issue introduced by those changes.

## Boundaries

This suite blocks service workers to isolate UI state and storage behavior. It does not validate service-worker update semantics, actual model runtime, screen-reader output, exhaustive keyboard interactions, operating-system print dialogs, or every browser's storage quota behavior. A storage exception is simulated; this is not a disk-capacity benchmark. Clinical meaning, calibration, and new experiment results remain outside the UI review.
