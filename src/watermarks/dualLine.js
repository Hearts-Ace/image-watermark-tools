import { calcSpacingScale } from '../utils/canvas/helpers.js';
import {
  calcFontSize,
  formatExifText,
  formatWatermarkDate,
  getHorizontalPadding,
  loadBrandLogo,
} from './shared.js';

const drawDualLineWatermark = (ctx, { settings, exifData, layout }) => {
  const { totalWidth, totalHeight, effectiveBottomBorder, scaledSettings } = layout;
  const spacingScale = calcSpacingScale(totalWidth);
  const { textPadding, leftMargin, rightMargin } = getHorizontalPadding(scaledSettings, spacingScale);
  const logoTextGap = 55 * spacingScale;
  const logoDividerGap = 25 * spacingScale;
  const dividerTextGap = 20 * spacingScale;

  const adjustedFontSize = calcFontSize(totalWidth, 60, settings.textSize || 1);
  const titleFontSize = adjustedFontSize;
  const subtitleFontSize = adjustedFontSize * 0.85;
  const lineHeight = adjustedFontSize * 1.5;
  const textStartY = totalHeight - effectiveBottomBorder + (effectiveBottomBorder - lineHeight * 2) / 2 + adjustedFontSize;

  ctx.fillStyle = '#333';

  ctx.font = `bold ${titleFontSize}px Arial`;
  ctx.textAlign = 'left';
  const lensName = settings.lensModel || (settings.focalLength ? `${settings.focalLength}mm` : 'Unknown Lens');
  ctx.fillText(lensName, leftMargin, textStartY);

  const cameraModel = settings.cameraModel || exifData?.Model || 'Unknown Camera';
  ctx.font = `${subtitleFontSize}px Arial`;
  ctx.fillText(cameraModel, leftMargin, textStartY + lineHeight);

  const settingsText = formatExifText(settings);
  const dateText = formatWatermarkDate(settings.customDate);
  const logoBaseHeight = Math.max(24, totalWidth / 50);

  return loadBrandLogo({
    settings,
    baseHeight: logoBaseHeight,
    maxHeight: effectiveBottomBorder,
  }).then((logo) => {
    if (!logo) return;

    ctx.font = `bold ${titleFontSize}px Arial`;
    const settingsTextWidth = ctx.measureText(settingsText).width;
    ctx.font = `${subtitleFontSize}px Arial`;
    const dateTextWidth = ctx.measureText(dateText).width;
    const rightTextMaxWidth = Math.max(settingsTextWidth, dateTextWidth);

    const rightEdge = totalWidth - rightMargin;
    const logoX = rightEdge - rightTextMaxWidth - logo.width - logoTextGap;
    const logoY = totalHeight - effectiveBottomBorder + (effectiveBottomBorder - logo.height) / 2;
    const dividerX = logoX + logo.width + logoDividerGap;
    const dividerStartY = textStartY - adjustedFontSize;
    const dividerEndY = textStartY + lineHeight + subtitleFontSize / 2;

    ctx.beginPath();
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 1;
    ctx.moveTo(dividerX, dividerStartY);
    ctx.lineTo(dividerX, dividerEndY);
    ctx.stroke();

    ctx.drawImage(logo.image, logoX, logoY, logo.width, logo.height);

    const rightTextX = dividerX + dividerTextGap;
    ctx.font = `bold ${titleFontSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(settingsText, rightTextX, textStartY);

    ctx.font = `${subtitleFontSize}px Arial`;
    ctx.fillText(dateText, rightTextX, textStartY + lineHeight);
  });
};

export default {
  id: 'dualLine',
  name: '双行对齐风格',
  extraFields: ['lensModel', 'customDate'],
  draw: drawDualLineWatermark,
};
