// script.js

// Canvas and context setup
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// State variables
let drawing = false;
let lineWidth = 5;
let brushColor = '#000000'; // Default brush color: black
let isPro = false;
let isEraser = false;
let history = [];
let historyStep = -1;

// Event listeners for drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// Toolbar functionality
document.getElementById('brushPlus').addEventListener('click', () => {
  lineWidth += 1;
});

document.getElementById('brushMinus').addEventListener('click', () => {
  if (lineWidth > 1) lineWidth -= 1;
});

document.getElementById('clearCanvas').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  saveHistory();
});

document.getElementById('saveImage').addEventListener('click', saveImage);

// Pro feature: Unlock Pro
document.getElementById('unlockPro').addEventListener('click', () => {
  isPro = true;
  document.getElementById('unlockPro').classList.add('hidden');
  document.getElementById('proToolbar').classList.remove('hidden');
  alert('Pro unlocked! Enjoy advanced features.');
});

// Pro features
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);
document.getElementById('layers').addEventListener('click', () => {
  if (isPro) alert('Layer management is not implemented yet.');
});
document.getElementById('eraser').addEventListener('click', () => {
  if (isPro) isEraser = !isEraser;
});

// Drawing logic
function startDrawing(e) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!drawing) return;

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = isEraser ? '#ffffff' : brushColor;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function stopDrawing() {
  drawing = false;
  ctx.closePath();
  saveHistory();
}

// Save canvas state to history
function saveHistory() {
  if (historyStep < history.length - 1) {
    history = history.slice(0, historyStep + 1);
  }
  history.push(canvas.toDataURL());
  historyStep = history.length - 1;
}

// Undo functionality
function undo() {
  if (historyStep > 0) {
    historyStep -= 1;
    const img = new Image();
    img.src = history[historyStep];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
}

// Redo functionality
function redo() {
  if (historyStep < history.length - 1) {
    historyStep += 1;
    const img = new Image();
    img.src = history[historyStep];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
}

// Save canvas as an image
function saveImage() {
  const link = document.createElement('a');
  link.download = 'artwork.png';
  link.href = canvas.toDataURL();
  link.click();
}
