const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resetButton = document.getElementById('resetButton');
const result = document.getElementById('result');

const SEGMENT_COUNT = 12;
const MIN_VALUE = 11_000;
const MAX_VALUE = 1_000_000;

let wheelValues = [];
let rotation = 0;
let spinning = false;

const palette = [
  '#63b3ff',
  '#6ce5b1',
  '#ffd166',
  '#f78c6b',
  '#c79bff',
  '#7ce2f2',
  '#f18ce0',
  '#92d05a',
  '#ff7f94',
  '#f6d365',
  '#70a1ff',
  '#66d9ef',
];

function resizeCanvas() {
  const size = Math.floor(canvas.getBoundingClientRect().width);
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = size * pixelRatio;
  canvas.height = size * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  drawWheel();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateWheelValues() {
  wheelValues = Array.from({ length: SEGMENT_COUNT }, () => randomInt(MIN_VALUE, MAX_VALUE));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function drawWheel() {
  const size = canvas.getBoundingClientRect().width;
  const radius = size / 2;
  const arc = (Math.PI * 2) / SEGMENT_COUNT;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(radius, radius);
  ctx.rotate(rotation);

  for (let i = 0; i < SEGMENT_COUNT; i += 1) {
    const startAngle = i * arc;
    const endAngle = startAngle + arc;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius - 8, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();

    ctx.save();
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#111329';
    ctx.font = `700 ${Math.max(11, size * 0.032)}px Inter, sans-serif`;
    ctx.fillText(formatCurrency(wheelValues[i]), radius - 18, 5);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.17, 0, Math.PI * 2);
  ctx.fillStyle = '#0d1330';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#d8dff8';
  ctx.stroke();

  ctx.restore();
}

function winningIndex() {
  const arc = (Math.PI * 2) / SEGMENT_COUNT;
  const normalized = ((Math.PI * 1.5 - rotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  return Math.floor(normalized / arc) % SEGMENT_COUNT;
}

function animateSpin() {
  spinning = true;
  spinButton.disabled = true;
  resetButton.disabled = true;
  result.textContent = 'Spinning...';

  const start = performance.now();
  const duration = randomInt(4200, 6200);
  const startRotation = rotation;
  const extraSpins = randomInt(5, 9) * Math.PI * 2;
  const offset = Math.random() * Math.PI * 2;
  const targetRotation = startRotation + extraSpins + offset;

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - (1 - progress) ** 4;
    rotation = startRotation + (targetRotation - startRotation) * eased;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    spinning = false;
    spinButton.disabled = false;
    resetButton.disabled = false;

    const index = winningIndex();
    result.textContent = `You landed on ${formatCurrency(wheelValues[index])}.`;
  }

  requestAnimationFrame(tick);
}

spinButton.addEventListener('click', () => {
  if (!spinning) {
    animateSpin();
  }
});

resetButton.addEventListener('click', () => {
  if (spinning) {
    return;
  }

  rotation = 0;
  generateWheelValues();
  drawWheel();
  result.textContent = 'New random wheel generated. Spin when ready!';
});

window.addEventListener('resize', resizeCanvas);

generateWheelValues();
resizeCanvas();
