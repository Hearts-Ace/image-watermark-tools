export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const calcSpacingScale = (totalWidth) => Math.max(1, totalWidth / 1200);

export const calcUiScale = (width) => Math.max(1, width / 1200);

export const scaleBorderSettings = (settings, uiScale) => ({
  ...settings,
  topBorder: (settings.topBorder || 0) * uiScale,
  rightBorder: (settings.rightBorder || 0) * uiScale,
  bottomBorder: (settings.bottomBorder || 0) * uiScale,
  leftBorder: (settings.leftBorder || 0) * uiScale,
  borderRadius: (settings.borderRadius || 0) * uiScale,
  colorStripTopOffset: (settings.colorStripTopOffset ?? settings.bottomBorder ?? 0) * uiScale,
});

export const applySoftShadow = (ctx, scale = 1) => {
  ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
  ctx.shadowBlur = 12 * scale;
  ctx.shadowOffsetX = 6 * scale;
  ctx.shadowOffsetY = 6 * scale;
};

export const roundedRectPath = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
};

export const drawRectShadow = (ctx, x, y, width, height, scale = 1) => {
  ctx.save();
  applySoftShadow(ctx, scale);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
  ctx.fillRect(x, y, width, height);
  ctx.restore();
};

export const drawRoundedRectShadow = (ctx, x, y, width, height, radius, scale = 1) => {
  ctx.save();
  applySoftShadow(ctx, scale);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.fill();
  ctx.restore();
};

export const drawRotatedShadow = (ctx, centerX, centerY, width, height, radians, scale = 1) => {
  ctx.save();
  applySoftShadow(ctx, scale);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
  ctx.translate(centerX, centerY);
  ctx.rotate(radians);
  ctx.fillRect(-width / 2, -height / 2, width, height);
  ctx.restore();
};

export const setupCanvas = (canvas, ctx, totalWidth, totalHeight, { forExport = false } = {}) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (forExport) {
    canvas.width = totalWidth;
    canvas.height = totalHeight;
  } else {
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = totalWidth * devicePixelRatio;
    canvas.height = totalHeight * devicePixelRatio;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.maxWidth = '100%';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
};

export const exportCanvas = (canvas, settings) =>
  new Promise((resolve, reject) => {
    const type = settings.imageFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Export failed'))),
      type,
      settings.imageQuality
    );
  });
