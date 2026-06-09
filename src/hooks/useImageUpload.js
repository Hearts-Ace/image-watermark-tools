import { useState } from 'react';
import { loadImageFromFile } from '../utils/imageLoader.js';
import {
  extractExifFromFile,
  extractExifFromImage,
  mapExifToCameraSettings,
} from '../utils/exifParser.js';

export const useImageUpload = (setSettings) => {
  const [image, setImage] = useState(null);
  const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 });
  const [exifData, setExifData] = useState(null);

  const applyExifToSettings = (exif) => {
    if (!exif) return;
    setSettings((prev) => ({
      ...prev,
      ...mapExifToCameraSettings(exif),
    }));
  };

  const processFile = async (file) => {
    if (!file) return;

    try {
      const { image: loadedImage, dimensions } = await loadImageFromFile(file);
      setImage(loadedImage);
      setOriginalImageDimensions(dimensions);

      const exif = loadedImage instanceof ImageBitmap
        ? await extractExifFromFile(file)
        : await extractExifFromImage(loadedImage);

      setExifData(exif);
      applyExifToSettings(exif);
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  const handleImageUpload = (event) => {
    processFile(event.target.files?.[0]);
  };

  return {
    image,
    exifData,
    originalImageDimensions,
    handleImageUpload,
    processFile,
  };
};
