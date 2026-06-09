import { calcSpacingScale } from '../utils/canvas/helpers.js';
import {
  calcFontSize,
  formatExifText,
  getHorizontalPadding,
  loadBrandLogo,
} from './shared.js';

const drawDefaultWatermark = (ctx, { settings, exifData, layout }) => {
  const { totalWidth, totalHeight, effectiveBottomBorder, scaledSettings } = layout;
  const spacingScale = calcSpacingScale(totalWidth);
  const { textPadding, leftMargin, rightMargin } = getHorizontalPadding(scaledSettings, spacingScale);
  const adjustedFontSize = calcFontSize(totalWidth, 50, settings.textSize || 1);

  ctx.fillStyle = '#333';
  ctx.font = `${adjustedFontSize}px Arial`;

  const centerY = totalHeight - effectiveBottomBorder / 2;
  const textY = centerY + adjustedFontSize / 3;

  const model = settings.cameraModel || exifData?.Model || 'Unknown Camera';
  ctx.textAlign = 'left';
  ctx.fillText(model, leftMargin, textY);

  const exifText = formatExifText(settings);
  if (exifText) {
    ctx.textAlign = 'right';
    ctx.fillText(exifText, totalWidth - rightMargin, textY);
  }

  const baseLogoHeight = Math.max(30, totalWidth / 40);
  return loadBrandLogo({
    settings,
    baseHeight: baseLogoHeight,
    maxHeight: effectiveBottomBorder - textPadding,
  }).then((logo) => {
    if (!logo) return;

    const logoX = (totalWidth - logo.width) / 2;
    const logoY = totalHeight - effectiveBottomBorder + (effectiveBottomBorder - logo.height) / 2;
    ctx.drawImage(logo.image, logoX, logoY, logo.width, logo.height);
  });
};

export default {
  id: 'default',
  name: '默认风格',
  extraFields: [],
  draw: drawDefaultWatermark,
};
