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

// Event listeners for mouse and touch
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

canvas.addEventListener('touchstart', startTouch);
canvas.addEventListener('touchmove', drawTouch);
canvas.addEventListener('touchend', stopTouch);

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
  startPayment();
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

// Drawing logic (Mouse)
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

// Drawing logic (Touch)
function startTouch(e) {
  e.preventDefault();
  drawing = true;
  const touch = e.touches[0];
  const { x, y } = getTouchPos(touch);
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function drawTouch(e) {
  e.preventDefault();
  if (!drawing) return;

  const touch = e.touches[0];
  const { x, y } = getTouchPos(touch);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = isEraser ? '#ffffff' : brushColor;
  ctx.lineTo(x, y);
  ctx.stroke();
}

function stopTouch(e) {
  e.preventDefault();
  drawing = false;
  ctx.closePath();
  saveHistory();
}

// Helper function to get touch position relative to the canvas
function getTouchPos(touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
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

// Razorpay payment function
function startPayment() {
  var options = {
    key: "YOUR_RAZORPAY_KEY",  // Replace with your Razorpay key
    amount: 250 * 100,  // Amount in paise (₹250)
    currency: "INR",
    name: "Digital Art App",
    description: "Unlock Pro Features",
    image: "https://www.yourapp.com/logo.png",
    handler: function (response) {
      // Simulate success: Unlock Pro features
      alert("Payment successful! Pro features unlocked.");
      isPro = true;
      document.getElementById('unlockPro').classList.add('hidden');
      document.getElementById('proToolbar').classList.remove('hidden');
    },
    prefill: {
      name: "User Name",
      email: "user@example.com",
      contact: "1234567890"
    },
    notes: {
      address: "Razorpay Test"
    },
    theme: {
      color: "#F37254"
    }
  };
  
  var rzp1 = new Razorpay(options);
  rzp1.open();
}
