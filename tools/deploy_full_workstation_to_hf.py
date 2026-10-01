import os
import sys
import shutil
from huggingface_hub import HfApi

TOKEN = os.environ.get('HF_TOKEN')
if not TOKEN:
    token_path = os.path.expanduser('~/.cache/huggingface/token')
    if os.path.exists(token_path):
        with open(token_path, 'r') as tf:
            TOKEN = tf.read().strip()
REPO_ID = 'Ressshh/tb-conformal-triage-workstation'

api = HfApi(token=TOKEN)
src_dir = '/root/tb-conformal-triage/tb_pwa_offline_workstation'
staging_dir = '/root/hf_space_sync_staging'

print('[1/4] Assembling clean staging folder for atomic commit...')
if os.path.exists(staging_dir):
    shutil.rmtree(staging_dir)
os.makedirs(staging_dir, exist_ok=True)

# Copy files
shutil.copy2(os.path.join(src_dir, 'index.html'), os.path.join(staging_dir, 'index.html'))
os.makedirs(os.path.join(staging_dir, 'templates'), exist_ok=True)
shutil.copy2(os.path.join(src_dir, 'index.html'), os.path.join(staging_dir, 'templates', 'index.html'))

# Static
os.makedirs(os.path.join(staging_dir, 'static', 'css'), exist_ok=True)
shutil.copy2(os.path.join(src_dir, 'static', 'css', 'workstation.css'), os.path.join(staging_dir, 'static', 'css', 'workstation.css'))

os.makedirs(os.path.join(staging_dir, 'static', 'js'), exist_ok=True)
shutil.copy2(os.path.join(src_dir, 'static', 'js', 'app.js'), os.path.join(staging_dir, 'static', 'js', 'app.js'))
shutil.copy2(os.path.join(src_dir, 'static', 'js', 'slider.js'), os.path.join(staging_dir, 'static', 'js', 'slider.js'))
shutil.copy2(os.path.join(src_dir, 'static', 'js', 'ood_calibration.js'), os.path.join(staging_dir, 'static', 'js', 'ood_calibration.js'))
shutil.copy2(os.path.join(src_dir, 'static', 'js', 'i18n.js'), os.path.join(staging_dir, 'static', 'js', 'i18n.js'))

# Manifest & Assets
if os.path.exists(os.path.join(src_dir, 'manifest.json')):
    shutil.copy2(os.path.join(src_dir, 'manifest.json'), os.path.join(staging_dir, 'manifest.json'))
if os.path.exists(os.path.join(src_dir, 'sw.js')):
    shutil.copy2(os.path.join(src_dir, 'sw.js'), os.path.join(staging_dir, 'sw.js'))
if os.path.exists(os.path.join(src_dir, 'assets')):
    shutil.copytree(os.path.join(src_dir, 'assets'), os.path.join(staging_dir, 'assets'), dirs_exist_ok=True)
if os.path.exists(os.path.join(src_dir, 'samples')):
    shutil.copytree(os.path.join(src_dir, 'samples'), os.path.join(staging_dir, 'samples'), dirs_exist_ok=True)

# Vendor (ONNX & KaTeX)
if os.path.exists(os.path.join(src_dir, 'vendor')):
    shutil.copytree(os.path.join(src_dir, 'vendor'), os.path.join(staging_dir, 'vendor'), dirs_exist_ok=True)

# Models (Distilled Tri-Output ONNX: logits, cam, latents)
if os.path.exists(os.path.join(src_dir, 'models')):
    shutil.copytree(os.path.join(src_dir, 'models'), os.path.join(staging_dir, 'models'), dirs_exist_ok=True)

# Standalone Launchers & Packages
if os.path.exists(os.path.join(src_dir, 'buka_aplikasi_offline.bat')):
    shutil.copy2(os.path.join(src_dir, 'buka_aplikasi_offline.bat'), os.path.join(staging_dir, 'buka_aplikasi_offline.bat'))
if os.path.exists(os.path.join(src_dir, 'buka_aplikasi_offline.sh')):
    shutil.copy2(os.path.join(src_dir, 'buka_aplikasi_offline.sh'), os.path.join(staging_dir, 'buka_aplikasi_offline.sh'))
if os.path.exists(os.path.join(src_dir, 'package.json')):
    shutil.copy2(os.path.join(src_dir, 'package.json'), os.path.join(staging_dir, 'package.json'))
if os.path.exists(os.path.join(src_dir, 'server.js')):
    shutil.copy2(os.path.join(src_dir, 'server.js'), os.path.join(staging_dir, 'server.js'))

print(f'[2/4] Staging ready at {staging_dir}. Listing files:')
for root, _, files in os.walk(staging_dir):
    for f in files:
        full_p = os.path.join(root, f)
        rel_p = os.path.relpath(full_p, staging_dir)
        sz = os.path.getsize(full_p)
        print(f'  - {rel_p} ({sz:,} bytes)')

print('[3/4] Uploading staging folder atomically to Hugging Face Space...')
try:
    commit_info = api.upload_folder(
        folder_path=staging_dir,
        repo_id=REPO_ID,
        repo_type='space',
        commit_message='Release v2.1.3: Deploy tri-output ONNX model (logits, cam, latents), bump cache keys, and add defensive multi-tier tensor extraction'
    )
    print('[4/4] Atomic upload succeeded! Commit:', commit_info)
except Exception as e:
    print('Upload folder failed:', e, file=sys.stderr)
    sys.exit(1)
