export const CACHE_KEYS = {
  CAMERA_INFO: 'photoEditorCameraInfo',
  SETTINGS: 'photoEditorSettings',
};

export const CAMERA_INFO_FIELDS = [
  'selectedBrand',
  'cameraModel',
  'lensModel',
  'focalLength',
  'aperture',
  'shutterSpeed',
  'iso',
];

export const SETTINGS_CACHE_FIELDS = [
  'topBorder',
  'rightBorder',
  'bottomBorder',
  'leftBorder',
  'borderRadius',
  'imageFormat',
  'imageQuality',
  'outputResolution',
  'logoSize',
  'textSize',
  'watermarkStyle',
  'customDate',
  'rotationAngle',
  'showPhotoShadow',
  'showColorStrip',
  'colorStripPosition',
  'colorStripLength',
  'colorStripTopOffset',
];

export const OUTPUT_RESOLUTIONS = {
  original: { label: '原始尺寸', maxWidth: null },
  high: { label: '高 (9000px)', maxWidth: 9000 },
  medium: { label: '中 (5000px)', maxWidth: 5000 },
  low: { label: '低 (3000px)', maxWidth: 3000 },
};

export const PREVIEW_MAX_WIDTH = 1800;

export const DEFAULT_SETTINGS = {
  topBorder: 20,
  rightBorder: 20,
  bottomBorder: 60,
  leftBorder: 20,
  borderRadius: 10,
  selectedBrand: 'sony',
  cameraModel: '',
  lensModel: '',
  focalLength: '',
  aperture: '',
  shutterSpeed: '',
  iso: '',
  customDate: '',
  imageFormat: 'png',
  imageQuality: 1.0,
  outputResolution: 'original',
  logoSize: 1.0,
  textSize: 1.0,
  watermarkStyle: 'default',
  rotationAngle: 0,
  showPhotoShadow: true,
  showColorStrip: false,
  colorStripPosition: 'right',
  colorStripLength: 0.35,
  colorStripTopOffset: 60,
};
