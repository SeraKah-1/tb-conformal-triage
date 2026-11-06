# Heatmap root cause — 4.8.5

The reported TB score 0.23% is below a hardcoded 15% visualization cutoff. generateHeatmapDataUrl returned null before rendering any CAM. This is sufficient to explain missing heatmap for that score if the running version used this code; the user's exact image/session was not recovered.

History:
- 7cb1d82f (2026-10-18) contains the 15% cutoff. Earlier 396d095 also introduced suppression; the maxVal <= 0.05 gate traces to that commit.
- 8e9121a (2026-11-04) disabled slider modes where heatmap was absent. It also appended moduleControls.decorate after an unconditional return, making it unreachable. This explains missing captured module configuration in that inference function.
- 4.8.2 added decoration at single/batch boundaries, masking the unreachable return; 4.8.5 repairs the function itself.
- 4.8.3/4.8.4 improved drag handling but did not address heatmap generation. Earlier statements implying they resolved the reported missing-map problem were too broad.

Fix:
- Remove probability-based suppression and the arbitrary 0.05 activation cutoff.
- Keep finite, square CAM validation; all-zero maps render transparently without invented hotspots.
- Keep current spatial taper/relative color normalization and score-dependent opacity; displayed colors are not calibrated lesion probabilities. Weak activation may be visually amplified by normalization.
- Return the decorated output through reachable code.

Eight Chromium regression checks pass using controlled logits/CAM tensors passed through the actual inference wrapper, renderer and slider. They cover a 0.23% TB score and weak CAM, invalid/zero arrays, settings capture and enabled slider. ONNX execution itself is stubbed: this is deterministic reproduction of application logic, not real patient inference or clinical explanation validation. Old stored results need reprocessing to obtain a map. A missing CAM output still cannot be synthesized.
