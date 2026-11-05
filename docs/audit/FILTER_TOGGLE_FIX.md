# Filter switch correction — 4.8.2

Restores 4.8.1 layout and corrects filter semantics. Model bytes, preprocessing, temperature and numeric thresholds unchanged.

- Score bands depend on numeric TB score alone: low below 0.20, high at least 0.65, intermediate otherwise. They are existing display bands, not validated clinical operating points.
- Disabled OOD does not fail an OOD availability gate. Disabled conformal does not veto the result with an empty set.
- Disabled modules remain explicitly disabled in details; they are not presented as passed, unavailable, or empty.
- Both single and batch processing stamp the captured settings at the result boundary. Historical records with no settings remain unknown; current settings must not be retroactively attributed to them.
- Enabled warnings remain separate evidence. Decode errors and technical rejection remain intact. No autonomous patient release is introduced.

30 Chromium workflow checks passed (11 switch/score cases, 10 DICOM/module cases, 9 batch/configuration cases). Tests use synthetic model outputs; they establish UI/control behavior, not diagnostic accuracy or a measured false-positive rate. The reported 99% flag rate has not been independently reproduced.
