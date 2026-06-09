import defaultWatermark from './default.js';
import dualLineWatermark from './dualLine.js';

export const watermarkStyles = [defaultWatermark, dualLineWatermark];

export const getWatermarkStyle = (styleId) =>
  watermarkStyles.find((style) => style.id === styleId) ?? defaultWatermark;

export const getExtraFieldsForStyle = (styleId) =>
  getWatermarkStyle(styleId).extraFields ?? [];
