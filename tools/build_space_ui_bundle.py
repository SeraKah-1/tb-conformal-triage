"""Package the reviewed PWA UI as an overlay for the existing static Space; never deploy."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'tb_pwa_offline_workstation'
FILES = ['assets/brand.svg', 'assets/brand-192.png', 'assets/brand-512.png', 'index.html', 'manifest.json', 'sw.js', 'static/css/workstation.css',
         'static/js/app.js', 'static/js/i18n.js', 'static/js/cases.js',
         'static/js/slider.js', 'static/js/ood_calibration.js', 'static/js/archive.js', 'static/js/settings.js']


def build(output):
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        raise FileExistsError(output)
    hashes = {name: hashlib.sha256((SOURCE / name).read_bytes()).hexdigest() for name in FILES}
    metadata = {
        'format': 'tb-static-space-ui-overlay-v1',
        'target': 'Ressshh/tb-conformal-triage-workstation',
        'deployed': False, 'files_sha256': hashes,
        'requires_existing_assets': ['vendor/', 'assets/', 'samples/', 'models/tb_conformal_distilled_v11_cam.onnx'],
        'model_sha256': '3f99751804bdd240ab3bea6b708456c51270acca6eeb71e659243ece0cd92592',
        'notes': 'Overlay for existing static Space. No credentials, case records, or images. Same source as PWA. Review before deployment.'}
    with zipfile.ZipFile(output, 'x', compression=zipfile.ZIP_DEFLATED) as archive:
        for name in FILES:
            archive.write(SOURCE / name, name)
        archive.writestr('UI_OVERLAY_MANIFEST.json', json.dumps(metadata, indent=2) + '\n')
    return {'path': str(output), 'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'files': len(FILES), 'deployed': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True)
    print(json.dumps(build(parser.parse_args().output), indent=2))
