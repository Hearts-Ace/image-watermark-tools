import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS } from '../constants/settings.js';
import {
  getCachedCameraInfo,
  getCachedSettings,
  saveCameraInfoToCache,
  saveSettingsToCache,
} from '../utils/storage.js';

const mergeInitialSettings = () => {
  const cachedInfo = getCachedCameraInfo();
  const cachedSettings = getCachedSettings();

  return {
    ...DEFAULT_SETTINGS,
    ...(cachedSettings ?? {}),
    selectedBrand: cachedInfo.selectedBrand || DEFAULT_SETTINGS.selectedBrand,
    cameraModel: cachedInfo.cameraModel || DEFAULT_SETTINGS.cameraModel,
    lensModel: cachedInfo.lensModel || DEFAULT_SETTINGS.lensModel,
    focalLength: cachedInfo.focalLength || DEFAULT_SETTINGS.focalLength,
    aperture: cachedInfo.aperture || DEFAULT_SETTINGS.aperture,
    shutterSpeed: cachedInfo.shutterSpeed || DEFAULT_SETTINGS.shutterSpeed,
    iso: cachedInfo.iso || DEFAULT_SETTINGS.iso,
  };
};

export const useEditorSettings = () => {
  const [settings, setSettings] = useState(mergeInitialSettings);

  useEffect(() => {
    const hasCameraInfo =
      settings.cameraModel ||
      settings.focalLength ||
      settings.aperture ||
      settings.shutterSpeed ||
      settings.iso ||
      settings.selectedBrand ||
      settings.lensModel;

    if (hasCameraInfo) {
      saveCameraInfoToCache(settings);
    }
    saveSettingsToCache(settings);
  }, [settings]);

  const updateSetting = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return { settings, setSettings, updateSetting };
};
