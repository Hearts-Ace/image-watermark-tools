import { clamp } from './helpers.js';

const getMiddleBandAverageColors = (image, width, height, sampleSize, sampleCount) => {
  const offscreen = document.createElement('canvas');
  offscreen.width = Math.max(1, Math.round(width));
  offscreen.height = Math.max(1, Math.round(height));
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return [];

  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = 'high';
  offCtx.drawImage(image, 0, 0, offscreen.width, offscreen.height);

  const colors = [];
  const centerY = offscreen.height / 2;

  for (let i = 0; i < sampleCount; i++) {
    const centerX = ((i + 0.5) * offscreen.width) / sampleCount;
    const x = clamp(Math.round(centerX - sampleSize / 2), 0, Math.max(0, offscreen.width - sampleSize));
    const y = clamp(Math.round(centerY - sampleSize / 2), 0, Math.max(0, offscreen.height - sampleSize));
    const w = Math.min(sampleSize, offscreen.width);
    const h = Math.min(sampleSize, offscreen.height);
    const imageData = offCtx.getImageData(x, y, w, h).data;

    let r = 0;
    let g = 0;
    let b = 0;
    const pixels = imageData.length / 4;
    for (let p = 0; p < imageData.length; p += 4) {
      r += imageData[p];
      g += imageData[p + 1];
      b += imageData[p + 2];
    }

    colors.push(`rgb(${Math.round(r / pixels)}, ${Math.round(g / pixels)}, ${Math.round(b / pixels)})`);
  }

  return colors;
};

export const drawColorStrip = (
  ctx,
  image,
  displayWidth,
  displayHeight,
  settings,
  rotatedWidth,
  effectiveBottomBorder
) => {
  const sampleSize = 100;
  const samples = 5;
  const stripScale = Math.max(1, rotatedWidth / 1200);
  const stripLengthRatio = clamp(settings.colorStripLength || 0.35, 0.2, 1);
  const stripWidth = Math.max(100, rotatedWidth * stripLengthRatio);
  const swatchWidth = stripWidth / samples;
  const swatchHeight = 22 * stripScale;

  const colors = getMiddleBandAverageColors(image, displayWidth, displayHeight, sampleSize, samples);
  if (!colors.length) return;

  const photoLeft = settings.leftBorder;
  const photoRight = settings.leftBorder + rotatedWidth;
  const stripX = settings.colorStripPosition === 'left'
    ? photoLeft
    : photoRight - stripWidth;

  const topOffset = settings.colorStripTopOffset ?? effectiveBottomBorder;
  const stripY = Math.max(0, topOffset);

  ctx.save();
  colors.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.fillRect(stripX + index * swatchWidth, stripY, swatchWidth, swatchHeight);
  });
  ctx.restore();
};
