const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');
const toggleButton = document.getElementById('toggleButton');
const waveSourceCountElement = document.getElementById('waveSourceCount');
const addWaveSourceButton = document.getElementById('addWaveSource');
const removeWaveSourceButton = document.getElementById('removeWaveSource');
const wavelengthSlider = document.getElementById('wavelengthSlider');
const wavelengthValue = document.getElementById('wavelengthValue');

let waveSources = [
    { x: 200, y: 300, frequency: 1 },
    { x: 400, y: 300, frequency: 1 },
    { x: 600, y: 300, frequency: 1 }
];

let wavelength = 50; // 単位: ピクセル
const waveSpeed = 2;
let showInterference = true;

toggleButton.addEventListener('click', () => {
    showInterference = !showInterference;
});

wavelengthSlider.addEventListener('input', () => {
    wavelength = parseInt(wavelengthSlider.value);
    wavelengthValue.textContent = `${wavelength} px`;
});

waveSourceCountElement.textContent = waveSources.length;

addWaveSourceButton.addEventListener('click', () => {
    if (waveSources.length < 6) {
        waveSources.push({ x: 100 + waveSources.length * 100, y: 300, frequency: 1 });
        waveSourceCountElement.textContent = waveSources.length;
    }
});

removeWaveSourceButton.addEventListener('click', () => {
    if (waveSources.length > 1) {
        waveSources.pop();
        waveSourceCountElement.textContent = waveSources.length;
    }
});

function drawWaveSources() {
    waveSources.forEach(source => {
        ctx.beginPath();
        ctx.arc(source.x, source.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
    });
}

function drawScale() {
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    // 横方向のスケール
    for (let x = 0; x <= canvas.width; x += 50) {
        ctx.moveTo(x, canvas.height - 5);
        ctx.lineTo(x, canvas.height);
        ctx.strokeText(`${x}px`, x, canvas.height - 10);
    }

    // 縦方向のスケール
    for (let y = 0; y <= canvas.height; y += 50) {
        ctx.moveTo(0, y);
        ctx.lineTo(5, y);
        ctx.strokeText(`${y}px`, 10, y + 5);
    }

    ctx.stroke();
}

function drawWaves() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScale(); // スケールを描画
    let time = performance.now() / 1000;
    
    waveSources.forEach(source => {
        for (let r = 0; r < Math.max(canvas.width, canvas.height); r += wavelength / 10) {
            let offset = waveSpeed * time % wavelength;
            let radius = r + offset;
            ctx.beginPath();
            ctx.arc(source.x, source.y, radius, 0, 2 * Math.PI);
            ctx.setLineDash(radius % wavelength < wavelength / 2 ? [] : [5, 5]); // 実線と点線を交互に
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
    });

    drawWaveSources();
}

function drawInterference() {
    let imageData = ctx.createImageData(canvas.width, canvas.height);
    
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            let sum = 0;
            
            waveSources.forEach(source => {
                let dx = x - source.x;
                let dy = y - source.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                sum += Math.sin((distance / wavelength) * 2 * Math.PI);
            });
            
            let index = (y * canvas.width + x) * 4;
            if (Math.abs(sum) < 0.1) {
                imageData.data[index] = 0;
                imageData.data[index + 1] = 0;
                imageData.data[index + 2] = 255;
                imageData.data[index + 3] = 255;
            } else if (Math.abs(sum) > 1.9) {
                imageData.data[index] = 255;
                imageData.data[index + 1] = 0;
                imageData.data[index + 2] = 0;
                imageData.data[index + 3] = 255;
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    drawWaveSources();
    drawScale(); // 干渉パターンにスケールを描画
}

function animate() {
    drawWaves();
    if (showInterference) {
        drawInterference();
    }
    requestAnimationFrame(animate);
}

animate();

canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', onMouseUp);

let isDragging = false;
let draggedSource = null;

function onMouseDown(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    
    waveSources.forEach(source => {
        let dx = x - source.x;
        let dy = y - source.y;
        if (Math.sqrt(dx * dx + dy * dy) < 10) {
            isDragging = true;
            draggedSource = source;
        }
    });
}

function onMouseMove(event) {
    if (isDragging && draggedSource) {
        let rect = canvas.getBoundingClientRect();
        draggedSource.x = event.clientX - rect.left;
        draggedSource.y = event.clientY - rect.top;
    }
}

function onMouseUp() {
    isDragging = false;
    draggedSource = null;
}
