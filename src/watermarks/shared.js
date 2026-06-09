import { getBrand } from '../constants/brands.js';

export const formatExifText = (settings) => {
  const focalLength = settings.focalLength ? `${settings.focalLength}mm` : '';
  const fNumber = settings.aperture ? `f/${settings.aperture}` : '';
  const shutterSpeed = settings.shutterSpeed ? `1/${settings.shutterSpeed}` : '';
  const iso = settings.iso ? `ISO ${settings.iso}` : '';
  return [focalLength, fNumber, shutterSpeed, iso].filter(Boolean).join(' | ');
};

export const calcFontSize = (totalWidth, divisor, textSize = 1) =>
  Math.max(14, totalWidth / divisor) * textSize;

export const getHorizontalPadding = (scaledSettings, spacingScale) => {
  const textPadding = 10 * spacingScale;
  const leftMargin = scaledSettings.leftBorder > 0
    ? scaledSettings.leftBorder + textPadding
    : textPadding;
  const rightMargin = scaledSettings.rightBorder > 0
    ? scaledSettings.rightBorder + textPadding
    : textPadding;
  return { textPadding, leftMargin, rightMargin };
};

export const loadBrandLogo = ({ settings, baseHeight, maxHeight }) =>
  new Promise((resolve) => {
    if (maxHeight < 20) {
      resolve(null);
      return;
    }

    const brand = getBrand(settings.selectedBrand);
    const logoHeight = Math.min(baseHeight * settings.logoSize * brand.defaultScale, maxHeight);
    const img = new Image();

    img.onload = () => {
      const aspectRatio = img.width / img.height;
      resolve({
        image: img,
        width: logoHeight * aspectRatio,
        height: logoHeight,
      });
    };

    img.onerror = () => {
      console.error(`无法加载${settings.selectedBrand}品牌logo`);
      resolve(null);
    };

    img.src = brand.logo;
  });

export const formatWatermarkDate = (customDate) => {
  if (customDate) return customDate;
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};
