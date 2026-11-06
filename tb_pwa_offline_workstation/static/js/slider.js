// Split Comparison Slider Module (Hardware-Accelerated CSS clip-path)

function onSliderMove(val, force = false) {
    var divider = document.getElementById('slider-divider');
    var heatImg = document.getElementById('img-heat');
    var control = document.getElementById('slider-control');
    
    if (control && control.disabled && !force) return;
    val = Number(val);
    if (!Number.isFinite(val)) return;
    val = Math.max(0, Math.min(100, val));
    if (!force && control && !control.disabled) {
        for (const mode of ['orig','heat','split']) document.getElementById('btn-mode-'+mode)?.classList.toggle('active',mode==='split');
        if (divider) divider.hidden=false;
    }
    if (control && Number(control.value) !== val) control.value = val;
    if (divider) divider.style.left = val + '%';
    // Native CXR on left, Heatmap on right: clip heatmap from left by val%
    if (heatImg) heatImg.style.clipPath = 'inset(0 0 0 ' + val + '%)';
}

function setSliderMode(mode) {
    var control = document.getElementById('slider-control');
    var btnSplit = document.getElementById('btn-mode-split');
    var btnOrig = document.getElementById('btn-mode-orig');
    var btnHeat = document.getElementById('btn-mode-heat');

    if ((mode === 'split' && btnSplit?.disabled) || (mode === 'heat' && btnHeat?.disabled)) mode = 'orig';
    if (control) control.disabled = !btnSplit || btnSplit.disabled;
    const divider = document.getElementById('slider-divider');
    if (divider) divider.hidden = mode !== 'split';

    if (btnSplit) btnSplit.classList.remove('active');
    if (btnOrig) btnOrig.classList.remove('active');
    if (btnHeat) btnHeat.classList.remove('active');

    if (mode === 'split') {
        if (btnSplit) btnSplit.classList.add('active');
        if (control) control.value = 50;
        onSliderMove(50, true);
    } else if (mode === 'orig') {
        // 100% Native CXR: clip heatmap completely (val = 100)
        if (btnOrig) btnOrig.classList.add('active');
        if (control) control.value = 100;
        onSliderMove(100, true);
    } else if (mode === 'heat') {
        // 100% Heatmap: reveal heatmap completely (val = 0)
        if (btnHeat) btnHeat.classList.add('active');
        if (control) control.value = 0;
        onSliderMove(0, true);
    }
}

function initSliderInteractions() {
    var viewport = document.getElementById('slider-viewport');
    if (!viewport) return;

    var isDragging = false;

    function handlePointerMove(e) {
        if (!isDragging || document.getElementById('slider-control')?.disabled) return;
        var rect = viewport.getBoundingClientRect();
        var clientX = e.clientX;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
        }
        if (clientX === undefined || isNaN(clientX)) return;
        var offsetX = clientX - rect.left;
        var pct = rect.width > 0 ? Math.max(0, Math.min(100, (offsetX / rect.width) * 100)) : 50;
        onSliderMove(Math.round(pct));
    }

    viewport.addEventListener('dragstart', e => e.preventDefault());
    viewport.addEventListener('pointerdown', e => {
        if ((e.pointerType==='mouse' && e.button!==0) || document.getElementById('slider-control')?.disabled) return;
        e.preventDefault();isDragging=true;
        viewport.setPointerCapture?.(e.pointerId);
        handlePointerMove(e);
    });
    viewport.addEventListener('pointermove',handlePointerMove);
    const stop = () => { isDragging=false; };
    viewport.addEventListener('pointerup',stop);
    viewport.addEventListener('pointercancel',stop);
    viewport.addEventListener('lostpointercapture',stop);
}

document.addEventListener('DOMContentLoaded', initSliderInteractions);
