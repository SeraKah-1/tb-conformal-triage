# Browser control audit — 4.8.3

Preserves the 4.8.1 layout and 4.8.2 filter corrections.

## Fixed
- Slider was disabled after selecting Original or Overlay even with a stored heatmap. Dragging the range or image now returns to comparison mode. No-heatmap results still cannot fabricate a heatmap.
- Next remained clickable with only one visible case and performed no action. It is now disabled with an explanation.
- Offline readiness did not check slider, DICOM, or module-control assets. These files are now required before reporting ready.
- Three stale tests were corrected: old cache version, fixed border-radius expectation, and low-score filter assumption from before the score/conformal separation.

## Browser checks
Chromium at 390 and 1440 pixels: real pointer drag, range interaction, Original/Compare/Overlay, Back, no-heatmap handling, no-next-case behavior, and horizontal overflow. Screenshots inspected under /workspace/audit-tb/controls-20261106.

Additional suites exercise single upload/process, batch import/process/cancel, filter/search/sort, pagination and scale, notes, save/reload/delete, archive backup/restore, exports, loading/failure, language, settings, DICOM and per-run configuration, offline reload and missing assets. Initial sweep ran 14 suites; three stale assertions failed and passed after targeted correction.

Model outputs in these UI tests are synthetic. Screenshots with substituted image overlays test interaction only, not model heatmap correctness. This audit does not establish why a particular user's result contains no heatmap. Real model CAM generation, device camera permissions, native printing, and installation on every OS are not validated here. Existing no-heatmap notice remains visible.

Disabled controls with legitimate prerequisites: Process needs an input; Export needs cases; Mark reviewed needs a completed result; pagination needs another page; heatmap controls need a heatmap. These are not treated as successful model predictions.
