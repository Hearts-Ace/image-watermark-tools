import {
  CACHE_KEYS,
  CAMERA_INFO_FIELDS,
  SETTINGS_CACHE_FIELDS,
} from '../constants/settings.js';

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from cache:`, error);
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to cache:`, error);
  }
};

const pickFields = (source, fields) =>
  Object.fromEntries(fields.map((field) => [field, source[field]]));

export const getCachedCameraInfo = () =>
  readJson(CACHE_KEYS.CAMERA_INFO, {});

export const getCachedSettings = () =>
  readJson(CACHE_KEYS.SETTINGS, null);

export const saveCameraInfoToCache = (settings) => {
  writeJson(CACHE_KEYS.CAMERA_INFO, pickFields(settings, CAMERA_INFO_FIELDS));
};

export const saveSettingsToCache = (settings) => {
  writeJson(CACHE_KEYS.SETTINGS, pickFields(settings, SETTINGS_CACHE_FIELDS));
};

export const clearCameraInfoCache = () => {
  try {
    localStorage.removeItem(CACHE_KEYS.CAMERA_INFO);
  } catch (error) {
    console.error('Error clearing camera info cache:', error);
  }
};
