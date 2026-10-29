# Menu-state and archive verification

Independent browser regression initially passed29checks after the case-state fixes. Parent follow-up added a Save-while-typing assertion; the menu suite now passes30checks, including preserved note focus and an enabled Save control after completion. No actual model inference was executed.

Verified behavior includes generation-bound review, disabled review for pending/processing/failed results, per-case/revision Save feedback, preservation of edits made during Save, no resurrection of a deleted pending single request, explicit filtered-list/selected processing, no processing controls or execution in Saved, job-specific progress and explicit one-shot Retry.

Fifteen archive/Settings browser assertions passed: preview before processing, Settings and ID/EN, backup including saved image bytes/model provenance, restore roundtrip, existing-ID skip, future-version rejection, duplicate-ID rejection, corrupted-image hash rejection, external-image URL rejection and atomic rollback on a simulated second-write abort. No image or note was sent to a remote server by these archive actions.

The DOM mock in JS safety tests was extended with classList.toggle for the actual preview UI; the safety suite then passed. Existing single-image, workflow, scale and offline suites were retained, with assertions updated for the explicit Process shown/Proses daftar label and case-scoped Save errors.

These checks use synthetic/branding images and mocked model calls. They do not measure real thousand-image inference/memory, establish clinical accuracy or prove every browser's quota behavior. Backup is bounded and local; it does not supply durable automatic compute resume. Data integrity checks do not authenticate clinical findings. This review was performed before deployment. Release status is recorded separately.
