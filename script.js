// script.js

// Canvas and context setup
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// State variables
let drawing = false;
let lineWidth = 5;
let isPro = false;

// Event listeners for drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

function startDrawing(e) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function stopDrawing() {
  drawing = false;
  ctx.closePath();
}

// Toolbar functionality
document.getElementById('brushPlus').addEventListener('click', () => {
  lineWidth += 1;
});

document.getElementById('brushMinus').addEventListener('click', () => {
  if (lineWidth > 1) lineWidth -= 1;
});

document.getElementById('clearCanvas').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Pro features
document.getElementById('unlockPro').addEventListener('click', () => {
  isPro = true;
  document.getElementById('unlockPro').classList.add('hidden');
  document.getElementById('proToolbar').classList.remove('hidden');
  alert('Pro unlocked! Enjoy advanced features.');
});

document.getElementById('undo').addEventListener('click', () => {
  if (isPro) {
    alert('Undo feature is not implemented in this demo.');
  }
});

document.getElementById('redo').addEventListener('click', () => {
  if (isPro) {
    alert('Redo feature is not implemented in this demo.');
  }
});

document.getElementById('layers').addEventListener('click', () => {
  if (isPro) {
    alert('Layer management is not implemented in this demo.');
  }
});
