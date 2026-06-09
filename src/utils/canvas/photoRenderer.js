import {
  drawRectShadow,
  drawRoundedRectShadow,
  drawRotatedShadow,
  roundedRectPath,
} from './helpers.js';

export const drawPhoto = (ctx, image, settings, layout) => {
  const {
    width,
    height,
    scaledSettings,
    rotationAngle,
    rotationRadians,
    rotatedWidth,
    rotatedHeight,
    uiScale,
  } = layout;

  const radius = Math.min(
    scaledSettings.borderRadius || 0,
    scaledSettings.topBorder || 0,
    scaledSettings.rightBorder || 0,
    scaledSettings.bottomBorder || 0,
    scaledSettings.leftBorder || 0
  );

  if (rotationAngle !== 0) {
    const centerX = scaledSettings.leftBorder + rotatedWidth / 2;
    const centerY = scaledSettings.topBorder + rotatedHeight / 2;

    if (settings.showPhotoShadow !== false) {
      drawRotatedShadow(ctx, centerX, centerY, width, height, rotationRadians, uiScale);
    }

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationRadians);
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    ctx.restore();
    return;
  }

  const hasRoundedBorder =
    scaledSettings.borderRadius > 0 &&
    scaledSettings.topBorder > 0 &&
    scaledSettings.rightBorder > 0 &&
    scaledSettings.bottomBorder > 0 &&
    scaledSettings.leftBorder > 0;

  if (hasRoundedBorder) {
    ctx.save();
    ctx.beginPath();
    if (settings.showPhotoShadow !== false) {
      drawRoundedRectShadow(
        ctx,
        scaledSettings.leftBorder,
        scaledSettings.topBorder,
        width,
        height,
        radius,
        uiScale
      );
    }
    roundedRectPath(
      ctx,
      scaledSettings.leftBorder,
      scaledSettings.topBorder,
      width,
      height,
      radius
    );
    ctx.clip();
    ctx.drawImage(image, scaledSettings.leftBorder, scaledSettings.topBorder, width, height);
    ctx.restore();
    return;
  }

  if (settings.showPhotoShadow !== false) {
    drawRectShadow(
      ctx,
      scaledSettings.leftBorder,
      scaledSettings.topBorder,
      width,
      height,
      uiScale
    );
  }
  ctx.drawImage(image, scaledSettings.leftBorder, scaledSettings.topBorder, width, height);
};
