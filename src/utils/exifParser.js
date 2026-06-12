import exifr from 'exifr';
import { getCachedCameraInfo } from './storage.js';

const EXIF_PARSE_OPTIONS = {
  tiff: true,
  ifd0: true,
  exif: true,
  mergeOutput: true,
  reviveValues: true,
};

export const extractExifFromFile = async (file) => {
  try {
    return (await exifr.parse(file, EXIF_PARSE_OPTIONS)) ?? {};
  } catch (error) {
    console.error('Error parsing EXIF:', error);
    return {};
  }
};

const formatAperture = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return Number.isInteger(number) ? String(number) : String(Number(number.toFixed(1)));
};

const formatLensInfo = (lensInfo) => {
  if (!lensInfo) return '';
  if (typeof lensInfo === 'string') return lensInfo.trim();
  if (!Array.isArray(lensInfo) || lensInfo.length < 4) return '';

  const [minFocal, maxFocal, minAperture, maxAperture] = lensInfo;
  const focalPart = minFocal === maxFocal
    ? `${minFocal}mm`
    : `${minFocal}-${maxFocal}mm`;
  const aperturePart = minAperture === maxAperture
    ? `f/${formatAperture(minAperture)}`
    : `f/${formatAperture(minAperture)}-${formatAperture(maxAperture)}`;
  return `${focalPart} ${aperturePart}`;
};

const pickCameraModel = (exif) => {
  const model = exif?.Model?.trim();
  const make = exif?.Make?.trim();
  if (!model) return make || '';
  if (make && !model.toLowerCase().includes(make.toLowerCase())) {
    return `${make} ${model}`;
  }
  return model;
};

const pickLensModel = (exif) => {
  if (exif?.LensModel) return String(exif.LensModel).trim();
  return formatLensInfo(exif?.LensInfo ?? exif?.LensSpecification);
};

const pickFocalLength = (exif) => {
  const focal = exif?.FocalLength
    ?? exif?.FocalLengthIn35mmFormat
    ?? exif?.FocalLengthIn35mmFilm;
  return focal ? Math.round(Number(focal)) : '';
};

const pickAperture = (exif) => (exif?.FNumber ? formatAperture(exif.FNumber) : '');

const pickShutterSpeed = (exif) => {
  const exposureTime = Number(exif?.ExposureTime);
  if (!Number.isFinite(exposureTime) || exposureTime <= 0) return '';
  if (exposureTime >= 1) return String(Math.round(exposureTime));
  return String(Math.round(1 / exposureTime));
};

const pickIso = (exif) => {
  const iso = exif?.ISO
    ?? exif?.PhotographicSensitivity
    ?? exif?.ISOSpeedRatings
    ?? exif?.RecommendedExposureIndex;
  if (iso == null || iso === '') return '';
  const value = Array.isArray(iso) ? iso[0] : iso;
  return String(value);
};

const preferExifValue = (exifValue, cachedValue) => {
  if (exifValue !== '' && exifValue != null) return exifValue;
  return cachedValue || '';
};

export const mapExifToCameraSettings = (exif, cachedInfo = getCachedCameraInfo()) => {
  if (!exif) return {};

  const fromExif = {
    cameraModel: pickCameraModel(exif),
    lensModel: pickLensModel(exif),
    focalLength: pickFocalLength(exif),
    aperture: pickAperture(exif),
    shutterSpeed: pickShutterSpeed(exif),
    iso: pickIso(exif),
  };

  return {
    cameraModel: preferExifValue(fromExif.cameraModel, cachedInfo.cameraModel),
    lensModel: preferExifValue(fromExif.lensModel, cachedInfo.lensModel),
    focalLength: preferExifValue(fromExif.focalLength, cachedInfo.focalLength),
    aperture: preferExifValue(fromExif.aperture, cachedInfo.aperture),
    shutterSpeed: preferExifValue(fromExif.shutterSpeed, cachedInfo.shutterSpeed),
    iso: preferExifValue(fromExif.iso, cachedInfo.iso),
  };
};
