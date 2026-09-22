// Split Comparison Slider Module (Hardware-Accelerated CSS clip-path)

function onSliderMove(val) {
    var divider = document.getElementById('slider-divider');
    var heatImg = document.getElementById('img-heat');
    var control = document.getElementById('slider-control');
    
    if (control && control.value !== val) control.value = val;
    if (divider) divider.style.left = val + '%';
    // Native CXR on left, Heatmap on right: clip heatmap from left by val%
    if (heatImg) heatImg.style.clipPath = 'inset(0 0 0 ' + val + '%)';
}

function setSliderMode(mode) {
    var control = document.getElementById('slider-control');
    var btnSplit = document.getElementById('btn-mode-split');
    var btnOrig = document.getElementById('btn-mode-orig');
    var btnHeat = document.getElementById('btn-mode-heat');

    if (btnSplit) btnSplit.classList.remove('active');
    if (btnOrig) btnOrig.classList.remove('active');
    if (btnHeat) btnHeat.classList.remove('active');

    if (mode === 'split') {
        if (btnSplit) btnSplit.classList.add('active');
        if (control) control.value = 50;
        onSliderMove(50);
    } else if (mode === 'orig') {
        // 100% Native CXR: clip heatmap completely (val = 100)
        if (btnOrig) btnOrig.classList.add('active');
        if (control) control.value = 100;
        onSliderMove(100);
    } else if (mode === 'heat') {
        // 100% Heatmap: reveal heatmap completely (val = 0)
        if (btnHeat) btnHeat.classList.add('active');
        if (control) control.value = 0;
        onSliderMove(0);
    }
}

function initSliderInteractions() {
    var viewport = document.getElementById('slider-viewport');
    if (!viewport) return;

    var isDragging = false;

    function handlePointerMove(e) {
        if (!isDragging) return;
        var rect = viewport.getBoundingClientRect();
        var clientX = e.clientX;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
        }
        var offsetX = clientX - rect.left;
        var pct = rect.width > 0 ? Math.max(0, Math.min(100, (offsetX / rect.width) * 100)) : 50;
        onSliderMove(Math.round(pct));
    }

    viewport.addEventListener('mousedown', function(e) {
        isDragging = true;
        handlePointerMove(e);
    });

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', function() { isDragging = false; });

    viewport.addEventListener('touchstart', function(e) {
        isDragging = true;
        handlePointerMove(e);
    }, { passive: true });

    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', function() { isDragging = false; });
}

document.addEventListener('DOMContentLoaded', initSliderInteractions);
