import EXIF from 'exif-js';
import { getCachedCameraInfo } from './storage.js';

export const extractExifFromFile = (file) =>
  new Promise((resolve) => {
    EXIF.getData(file, function onExifReady() {
      resolve(EXIF.getAllTags(this));
    });
  });

export const extractExifFromImage = (image) =>
  new Promise((resolve) => {
    EXIF.getData(image, function onExifReady() {
      resolve(EXIF.getAllTags(this));
    });
  });

export const mapExifToCameraSettings = (exif, cachedInfo = getCachedCameraInfo()) => ({
  cameraModel: cachedInfo.cameraModel || exif?.Model || '',
  lensModel: cachedInfo.lensModel || exif?.LensModel || '',
  focalLength: cachedInfo.focalLength || (exif?.FocalLength ? Math.round(exif.FocalLength) : ''),
  aperture: cachedInfo.aperture || exif?.FNumber || '',
  shutterSpeed: cachedInfo.shutterSpeed || (exif?.ExposureTime ? Math.round(1 / exif.ExposureTime) : ''),
  iso: cachedInfo.iso || exif?.ISOSpeedRatings || '',
});
