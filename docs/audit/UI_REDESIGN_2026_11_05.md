# Review workspace audit — 5 November 2026

Implemented locally, not deployed. Model and numerical thresholds unchanged.

## Findings and changes

- Batch colored almost every non-low result amber, including unavailable evidence. Row color now reflects a specific quality/reference/conformal caution; unavailable evidence stays neutral with its label. High scores and technical failures remain red; low scores blue. Green denotes a passed check, not healthy lungs.
- Every legacy OOD result repeated the same unverified-reference warning. Show that model-wide limitation above the workspace and retain it in case details, filters, exports, and stored evidence. It is not removed from scientific evidence.
- Zero-count warning groups now use neutral styling.
- Settings name IQA as Image quality / Kualitas gambar and OOD as Reference check / Cek referensi. Existing switches still freeze at the start of a batch. Turning a module off preserves mandatory decode/blank guards and review requirements.
- Added Offline (PWA) switch. Off unregisters this scope's service worker; on registers it. Reload applies the change. Saved cases and caches are not deleted. PWA is not an inference filter; existing tabs may remain controlled until reloaded. This is not a cache erasure or network privacy switch.
- Upload remains left and image/heatmap slider right; mobile stacks vertically. Reduced repetitive main-screen copy in both languages. Kept detailed filter explanations and clinical limitations.
- Added focus outlines, compact panels, neutral inactive switches, and responsive settings sizing. No new fonts, UI frameworks, or libraries.

## Basis

[ISO 24495-1](https://www.iso.org/standard/78907.html): help readers find, understand, and use information. Short buttons support this, but the standard does not require every sentence to be two words. No ISO compliance certification claimed.

[WCAG use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html): keep textual labels alongside color.

[Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) and [recognition rather than recall](https://www.nngroup.com/articles/recognition-and-recall/): expose main tasks; retain details on demand.

Requested anti-slop skill was not present in the available skill catalog or local skill search. No claim that it was applied.

## Calibration work still required

Do not replace arbitrary cutoffs with different arbitrary cutoffs. The live v11 IQA and score bands remain heuristic; its OOD reference is legacy/unverified. Object-CXR testing (200 images) found v11 OOD 43/200 and IQA advisories 6/200, but lacks verified TB and diagnostic-quality labels. These rates cannot establish false rejection or an optimal threshold.

1. Freeze model hash, preprocessing, feature layer, distance definition, and dataset provenance.
2. Use training-only features to fit OOD reference; separate calibration images to choose cutoffs. Never select thresholds on the final evaluation set.
3. Obtain expert quality annotations: unreadable, readable but limited, and usable. Distinguish non-CXR inputs, artifacts, and ordinary CXR variation. Include normal, TB, and other pathology.
4. Select operating points using sensitivity to truly unusable/non-CXR inputs and false alerts among usable CXR, with confidence intervals. Report subgroups and referral workload. Do not equate foreign objects with invalid images.
5. Fit classwise conformal quantiles from held-out labeled calibration data; report per-class coverage, empty/multiple sets, and uncertainty. Distribution shift can invalidate nominal coverage.
6. Ship numerical parameters in a model-bound, versioned, hash-checked calibration bundle. Reject mismatched bundles rather than allowing arbitrary user-entered cutoffs.
7. Evaluate a locked bundle on untouched data before replacing deployment. No new calibration or clinical validation completed by this UI change.

## Verification

Chromium mock-result tests: redesigned controls 32 checks; module/DICOM 10; evidence 24; batch configuration 9. These are workflow tests, not new ONNX inference or clinical validation. Screenshots in /workspace/audit-tb/ui-redesign-20261105. Service-worker-enabled lifecycle test also passed 4 checks: off persists, worker unregisters, worker registers, on persists.

Prior remote ONNX/WASM test: 13/13 identical-tensor cases passed. That does not establish JPEG/DICOM preprocessing parity or diagnostic accuracy.
