// Canvas setup
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let drawing = false;
let lineWidth = 5;
let isPro = false;
let history = [];
let historyStep = -1;

// Event listeners for mouse/touch
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

canvas.addEventListener('touchstart', startTouch);
canvas.addEventListener('touchmove', drawTouch);
canvas.addEventListener('touchend', stopTouch);

// Toolbar functionality
document.getElementById('brushPlus').addEventListener('click', () => lineWidth++);
document.getElementById('brushMinus').addEventListener('click', () => lineWidth > 1 ? lineWidth-- : lineWidth);
document.getElementById('clearCanvas').addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));
document.getElementById('saveImage').addEventListener('click', saveImage);
document.getElementById('unlockPro').addEventListener('click', startPayment);

// Pro features
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);

// Drawing functions
function startDrawing(e) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = '#000';
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function stopDrawing() {
  drawing = false;
  ctx.closePath();
  saveHistory();
}

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
  ctx.strokeStyle = '#000';
  ctx.lineTo(x, y);
  ctx.stroke();
}

function stopTouch(e) {
  e.preventDefault();
  drawing = false;
  ctx.closePath();
  saveHistory();
}

function getTouchPos(touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

function saveImage() {
  const link = document.createElement('a');
  link.download = 'artwork.png';
  link.href = canvas.toDataURL();
  link.click();
}

function saveHistory() {
  if (historyStep < history.length - 1) {
    history = history.slice(0, historyStep + 1);
  }
  history.push(canvas.toDataURL());
  historyStep = history.length - 1;
}

function undo() {
  if (historyStep > 0) {
    historyStep--;
    const img = new Image();
    img.src = history[historyStep];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
}

function redo() {
  if (historyStep < history.length - 1) {
    historyStep++;
    const img = new Image();
    img.src = history[historyStep];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
}

// Razorpay Payment
function startPayment() {
  fetch('/create_order', {
    method: 'POST',
  })
    .then(response => response.json())
    .then(data => {
      var options = {
        key: "{{ razorpay_key_id }}", // Your Razorpay Key ID
        amount: data.amount,
        currency: "INR",
        name: "Digital Art App",
        order_id: data.order_id,
        handler: function (response) {
          alert("Payment successful! Pro features unlocked.");
          isPro = true;
          document.getElementById('proToolbar').classList.remove('hidden');
        }
      };
      var rzp1 = new Razorpay(options);
      rzp1.open();
    });
}
