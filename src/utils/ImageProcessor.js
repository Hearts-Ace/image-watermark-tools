import { OUTPUT_RESOLUTIONS, PREVIEW_MAX_WIDTH } from '../constants/settings.js';
import { getWatermarkStyle } from '../watermarks/index.js';
import {
  calcUiScale,
  exportCanvas,
  scaleBorderSettings,
  setupCanvas,
} from './canvas/helpers.js';
import { drawColorStrip } from './canvas/colorStrip.js';
import { drawPhoto } from './canvas/photoRenderer.js';

const resolveMaxWidth = (settings, image, isPreview) => {
  const preset = OUTPUT_RESOLUTIONS[settings.outputResolution] ?? OUTPUT_RESOLUTIONS.original;
  let maxWidth = preset.maxWidth ?? image.width;

  if (isPreview) {
    maxWidth = Math.min(maxWidth, PREVIEW_MAX_WIDTH);
  }

  return maxWidth;
};

const buildLayout = (image, settings, isPreview) => {
  const maxWidth = resolveMaxWidth(settings, image, isPreview);
  const aspectRatio = image.width / image.height;
  const width = Math.min(image.width, maxWidth);
  const height = width / aspectRatio;
  const uiScale = calcUiScale(width);
  const scaledSettings = scaleBorderSettings(settings, uiScale);
  const rotationAngle = settings.rotationAngle || 0;
  const rotationRadians = (rotationAngle * Math.PI) / 180;

  const absCos = Math.abs(Math.cos(rotationRadians));
  const absSin = Math.abs(Math.sin(rotationRadians));
  const rotatedWidth = width * absCos + height * absSin;
  const rotatedHeight = width * absSin + height * absCos;

  const totalWidth = rotatedWidth + scaledSettings.leftBorder + scaledSettings.rightBorder;
  const totalHeight = rotatedHeight + scaledSettings.topBorder + scaledSettings.bottomBorder;
  const effectiveBottomBorder = Math.max(scaledSettings.bottomBorder, 0);

  return {
    width,
    height,
    scaledSettings,
    rotationAngle,
    rotationRadians,
    rotatedWidth,
    rotatedHeight,
    totalWidth,
    totalHeight,
    effectiveBottomBorder,
    uiScale,
  };
};

const processImage = (canvas, image, settings, exifData, options = {}) => {
  const isPreview = options.mode === 'preview';
  const ctx = canvas.getContext('2d');
  const layout = buildLayout(image, settings, isPreview);

  setupCanvas(canvas, ctx, layout.totalWidth, layout.totalHeight, { forExport: !isPreview });

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, layout.totalWidth, layout.totalHeight);

  drawPhoto(ctx, image, settings, layout);

  const watermarkStyle = getWatermarkStyle(settings.watermarkStyle);
  const drawWatermark = layout.effectiveBottomBorder > 0
    ? watermarkStyle.draw(ctx, { settings, exifData, layout })
    : Promise.resolve();

  return drawWatermark.then(() => {
    if (settings.showColorStrip) {
      drawColorStrip(
        ctx,
        image,
        layout.width,
        layout.height,
        layout.scaledSettings,
        layout.rotatedWidth,
        layout.effectiveBottomBorder
      );
    }

    if (isPreview) return;
    return exportCanvas(canvas, settings);
  });
};

export const exportProcessedImage = (image, settings, exifData) => {
  const canvas = document.createElement('canvas');
  return processImage(canvas, image, settings, exifData, { mode: 'export' });
};

export default processImage;
