// Exercise the actual IQA function with synthetic native-coordinate pixels.
// No model runtime, image decoder, or training libraries are used.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../tb_pwa_offline_workstation/static/js/app.js'), 'utf8');
const start = source.indexOf('function evaluatePreAnalyticQuality(');
const end = source.indexOf('function preprocessImageForONNX(', start);
assert.ok(start >= 0 && end > start, 'Actual IQA function is present');

function syntheticCanvas() {
    return {
        width: 512, height: 512,
        getContext() {
            let cropX = 0, cropY = 0, pattern = 'blocks';
            return {
                drawImage(...args) {
                    pattern = args[0].pattern || 'blocks';
                    if (args.length === 9) { cropX = args[1]; cropY = args[2]; }
                },
                getImageData(_x, _y, width, height) {
                    const data = new Uint8ClampedArray(width * height * 4);
                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            // A global 8-pixel grid is unchanged by where the central crop starts.
                            const value = pattern === 'blocks'
                                ? ((Math.floor((x + cropX) / 8) + Math.floor((y + cropY) / 8)) % 2 ? 180 : 80)
                                : 60 + x * .15 + y * .1;
                            const index = (y * width + x) * 4;
                            data[index] = data[index + 1] = data[index + 2] = value;
                            data[index + 3] = 255;
                        }
                    }
                    return {data};
                }
            };
        }
    };
}

const context = {document: {createElement: syntheticCanvas}, Float32Array, Uint32Array, Math};
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);
function evaluate(size, pattern = 'blocks') {
    return context.evaluatePreAnalyticQuality({naturalWidth: size, naturalHeight: size, pattern}, syntheticCanvas());
}

test('Native 8-pixel discontinuities remain flagged across central crop alignment', () => {
    const sizes = [512, 514, 516, 520, 528];
    const results = sizes.map(size => evaluate(size));
    for (let i = 0; i < sizes.length; i++) {
        assert.equal(results[i].is_heavy_compression, true, `size ${sizes[i]} must retain global grid evidence`);
        assert.ok(results[i].blockiness_score > 1.70, 'Discontinuity score must exceed advisory threshold');
        assert.ok(Math.abs(results[i].blockiness_score / results[0].blockiness_score - 1) < .001,
            'Changing crop offset must not erase the same block-edge signal');
    }
});

test('Smooth synthetic gradients do not become compression artifacts at crop offsets', () => {
    for (const size of [512, 514, 528]) {
        const result = evaluate(size, 'smooth');
        assert.ok(Number.isFinite(result.blockiness_score));
        assert.equal(result.is_heavy_compression, false, `size ${size}: smooth gradient should remain advisory-free`);
    }
});
