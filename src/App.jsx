// src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import EXIF from 'exif-js';
import Controls from './components/Controls';
import WatermarkStyles from './components/WatermarkStyles';
import BokehTest from './components/BokehTest';
import DistortionTestGrid from './components/DistortionTestGrid';
import StripeTestPattern from './components/StripeTestPattern';
import processImage from './utils/ImageProcessor';

// 相机信息缓存的localStorage键名
const CAMERA_INFO_CACHE_KEY = 'photoEditorCameraInfo';
const SETTINGS_CACHE_KEY = 'photoEditorSettings'; // 新增：所有设置的缓存键名

function App() {
  // 页面状态管理
  const [currentPage, setCurrentPage] = useState('editor'); // 'editor' or 'bokeh'
  
  // 从localStorage获取缓存的相机信息
  const getCachedCameraInfo = () => {
    try {
      const cachedInfo = localStorage.getItem(CAMERA_INFO_CACHE_KEY);
      return cachedInfo ? JSON.parse(cachedInfo) : {};
    } catch (error) {
      console.error('Error retrieving camera info from cache:', error);
      return {};
    }
  };

  // 从localStorage获取缓存的所有设置
  const getCachedSettings = () => {
    try {
      const cachedSettings = localStorage.getItem(SETTINGS_CACHE_KEY);
      return cachedSettings ? JSON.parse(cachedSettings) : null;
    } catch (error) {
      console.error('Error retrieving settings from cache:', error);
      return null;
    }
  };

  const cachedInfo = getCachedCameraInfo();
  const cachedSettings = getCachedSettings();

  const [image, setImage] = useState(null);
  const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 });
  const [settings, setSettings] = useState({
    // 如果有缓存的设置，则使用缓存值，否则使用默认值
    topBorder: cachedSettings?.topBorder ?? 20,
    rightBorder: cachedSettings?.rightBorder ?? 20,
    bottomBorder: cachedSettings?.bottomBorder ?? 60,
    leftBorder: cachedSettings?.leftBorder ?? 20,
    borderRadius: cachedSettings?.borderRadius ?? 10,
    selectedBrand: cachedInfo.selectedBrand || 'sony',
    cameraModel: cachedInfo.cameraModel || '',
    lensModel: cachedInfo.lensModel || '', // 新增镜头型号字段
    focalLength: cachedInfo.focalLength || '',
    aperture: cachedInfo.aperture || '',
    shutterSpeed: cachedInfo.shutterSpeed || '',
    iso: cachedInfo.iso || '',
    customDate: cachedSettings?.customDate || '', // 新增自定义日期字段
    // 图像导出格式设置
    imageFormat: cachedSettings?.imageFormat ?? 'png', // 默认png格式 (可选: 'jpeg', 'png')
    imageQuality: cachedSettings?.imageQuality ?? 1.0, // 默认最高质量 (范围: 0.1-1.0)
    outputResolution: cachedSettings?.outputResolution ?? 'original', // 默认使用原始分辨率
    logoSize: cachedSettings?.logoSize ?? 1.0, // 默认logo大小比例，1.0表示标准大小
    textSize: cachedSettings?.textSize ?? 1.0, // 默认文字大小比例，1.0表示标准大小
    watermarkStyle: cachedSettings?.watermarkStyle ?? 'default' // 默认水印风格
  });
  const [exifData, setExifData] = useState(null);
  const canvasRef = useRef(null);

  // 缓存相机信息
  const saveCameraInfoToCache = (info) => {
    try {
      const cameraInfo = {
        selectedBrand: info.selectedBrand,
        cameraModel: info.cameraModel,
        lensModel: info.lensModel,
        focalLength: info.focalLength,
        aperture: info.aperture,
        shutterSpeed: info.shutterSpeed,
        iso: info.iso
      };
      localStorage.setItem(CAMERA_INFO_CACHE_KEY, JSON.stringify(cameraInfo));
    } catch (error) {
      console.error('Error saving camera info to cache:', error);
    }
  };

  // 缓存所有设置参数
  const saveSettingsToCache = (settingsToSave) => {
    try {
      // 保存所有设置参数到缓存
      const settingsToCache = {
        topBorder: settingsToSave.topBorder,
        rightBorder: settingsToSave.rightBorder,
        bottomBorder: settingsToSave.bottomBorder,
        leftBorder: settingsToSave.leftBorder,
        borderRadius: settingsToSave.borderRadius,
        imageFormat: settingsToSave.imageFormat,
        imageQuality: settingsToSave.imageQuality,
        outputResolution: settingsToSave.outputResolution,
        logoSize: settingsToSave.logoSize,
        textSize: settingsToSave.textSize,
        watermarkStyle: settingsToSave.watermarkStyle, // 新增：保存水印风格到缓存
        customDate: settingsToSave.customDate // 新增：保存自定义日期到缓存
      };
      localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settingsToCache));
    } catch (error) {
      console.error('Error saving settings to cache:', error);
    }
  };

  // 监听settings变化，保存相机信息到缓存
  useEffect(() => {
    if (settings.cameraModel || settings.focalLength || settings.aperture || 
        settings.shutterSpeed || settings.iso || settings.selectedBrand || settings.lensModel) {
      saveCameraInfoToCache(settings);
    }
    
    // 保存所有设置参数到缓存
    saveSettingsToCache(settings);
  }, [settings]); // 监听整个settings对象的变化

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 使用createImageBitmap API处理大图像 (如果浏览器支持)
      if ('createImageBitmap' in window && /^image\/(?:jpeg|png|webp|bmp)$/.test(file.type)) {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
          const blob = new Blob([event.target.result], { type: file.type });
          createImageBitmap(blob).then(imageBitmap => {
            setImage(imageBitmap);
            setOriginalImageDimensions({
              width: imageBitmap.width,
              height: imageBitmap.height
            });
            
            // 提取EXIF数据
            EXIF.getData(file, function() {
              const exif = EXIF.getAllTags(this);
              setExifData(exif);
              
              if (exif) {
                // 如果缓存中已有相机信息，优先使用缓存中的信息
                const cameraInfoFromCache = getCachedCameraInfo();
                
                setSettings(prev => ({
                  ...prev,
                  cameraModel: cameraInfoFromCache.cameraModel || exif.Model || '',
                  lensModel: cameraInfoFromCache.lensModel || exif.LensModel || '',
                  focalLength: cameraInfoFromCache.focalLength || (exif.FocalLength ? Math.round(exif.FocalLength) : ''),
                  aperture: cameraInfoFromCache.aperture || exif.FNumber || '',
                  shutterSpeed: cameraInfoFromCache.shutterSpeed || (exif.ExposureTime ? Math.round(1/exif.ExposureTime) : ''),
                  iso: cameraInfoFromCache.iso || exif.ISOSpeedRatings || ''
                }));
              }
            });
          });
        };
        fileReader.readAsArrayBuffer(file);
      } else {
        // 回退到传统Image对象方式
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            setImage(img);
            setOriginalImageDimensions({
              width: img.width,
              height: img.height
            });
            
            EXIF.getData(img, function() {
              const exif = EXIF.getAllTags(this);
              setExifData(exif);
              
              if (exif) {
                // 如果缓存中已有相机信息，优先使用缓存中的信息
                const cameraInfoFromCache = getCachedCameraInfo();
                
                setSettings(prev => ({
                  ...prev,
                  cameraModel: cameraInfoFromCache.cameraModel || exif.Model || '',
                  lensModel: cameraInfoFromCache.lensModel || exif.LensModel || '',
                  focalLength: cameraInfoFromCache.focalLength || (exif.FocalLength ? Math.round(exif.FocalLength) : ''),
                  aperture: cameraInfoFromCache.aperture || exif.FNumber || '',
                  shutterSpeed: cameraInfoFromCache.shutterSpeed || (exif.ExposureTime ? Math.round(1/exif.ExposureTime) : ''),
                  iso: cameraInfoFromCache.iso || exif.ISOSpeedRatings || ''
                }));
              }
            });
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      processImage(canvasRef.current, image, settings, exifData).then(() => {
        // Image processing complete
      }).catch(error => {
        console.error('Error processing image:', error);
      });
    }
  }, [image, settings, exifData]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      const fileExtension = settings.imageFormat === 'jpeg' ? 'jpg' : 'png';
      link.download = `processed-image.${fileExtension}`;
      
      processImage(canvasRef.current, image, settings, exifData).then(dataUrl => {
        link.href = dataUrl;
        link.click();
      }).catch(error => {
        console.error('Error downloading image:', error);
      });
    }
  };

  // 处理图像格式变更
  const handleImageFormatChange = (format) => {
    setSettings(prev => ({
      ...prev,
      imageFormat: format
    }));
  };

  // 处理图像质量变更
  const handleQualityChange = (quality) => {
    setSettings(prev => ({
      ...prev,
      imageQuality: parseFloat(quality)
    }));
  };

  // 处理输出分辨率变更
  const handleResolutionChange = (resolution) => {
    setSettings(prev => ({
      ...prev,
      outputResolution: resolution
    }));
  };

  // 处理logo大小变更
  const handleLogoSizeChange = (size) => {
    setSettings(prev => ({
      ...prev,
      logoSize: parseFloat(size)
    }));
  };

  // 处理文字大小变更
  const handleTextSizeChange = (size) => {
    setSettings(prev => ({
      ...prev,
      textSize: parseFloat(size)
    }));
  };

  // 处理水印风格变更
  const handleWatermarkStyleChange = (style) => {
    setSettings(prev => ({
      ...prev,
      watermarkStyle: style
    }));
  };

  // 获取原图像尺寸文本
  const getOriginalDimensionsText = () => {
    if (originalImageDimensions.width > 0 && originalImageDimensions.height > 0) {
      return `原始尺寸: ${originalImageDimensions.width} × ${originalImageDimensions.height}`;
    }
    return '';
  }

  // 如果当前页面是镜头焦外测试，直接渲染BokehTest组件
  if (currentPage === 'bokeh') {
    return <BokehTest onExit={() => setCurrentPage('editor')} />;
  }

  // 如果当前页面是畸变检测，直接渲染DistortionTestGrid组件
  if (currentPage === 'distortion') {
    return <DistortionTestGrid onExit={() => setCurrentPage('editor')} />;
  }

  // 如果当前页面是条纹测试，直接渲染StripeTestPattern组件
  if (currentPage === 'stripe') {
    return <StripeTestPattern onExit={() => setCurrentPage('editor')} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Photo Border & Watermark</h1>
          <nav className="flex gap-4">
            <button
              onClick={() => setCurrentPage('editor')}
              className={`px-4 py-2 rounded transition-colors ${
                currentPage === 'editor'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              照片水印编辑器
            </button>
            <button
              onClick={() => setCurrentPage('bokeh')}
              className={`px-4 py-2 rounded transition-colors ${
                currentPage === 'bokeh'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              镜头焦外测试
            </button>
            <button
              onClick={() => setCurrentPage('distortion')}
              className={`px-4 py-2 rounded transition-colors ${
                currentPage === 'distortion'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              镜头畸变检测
            </button>
            <button
              onClick={() => setCurrentPage('stripe')}
              className={`px-4 py-2 rounded transition-colors ${
                currentPage === 'stripe'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              歪光轴检测
            </button>
          </nav>
        </div>
        
        <WatermarkStyles 
          selectedStyle={settings.watermarkStyle} 
          setSelectedStyle={handleWatermarkStyleChange} 
        />
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 xl:w-1/3 bg-white p-6 rounded-lg shadow">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mb-6 w-full"
            />
            <Controls settings={settings} setSettings={setSettings} />
            
            {image && (
              <div className="mt-4">
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-800 mb-2">导出设置</h3>
                  
                  {originalImageDimensions.width > 0 && (
                    <div className="text-sm text-gray-500 mb-3">
                      {getOriginalDimensionsText()}
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo大小</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings.logoSize}
                        onChange={(e) => handleLogoSizeChange(e.target.value)}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500 min-w-[45px]">{Math.round(settings.logoSize * 100)}%</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">文字大小</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings.textSize}
                        onChange={(e) => handleTextSizeChange(e.target.value)}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500 min-w-[45px]">{Math.round(settings.textSize * 100)}%</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">输出分辨率</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleResolutionChange('original')}
                        className={`px-3 py-1 rounded text-sm ${
                          settings.outputResolution === 'original'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        原始尺寸
                      </button>
                      <button
                        onClick={() => handleResolutionChange('high')}
                        className={`px-3 py-1 rounded text-sm ${
                          settings.outputResolution === 'high'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        高 (2400px)
                      </button>
                      <button
                        onClick={() => handleResolutionChange('medium')}
                        className={`px-3 py-1 rounded text-sm ${
                          settings.outputResolution === 'medium'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        中 (1800px)
                      </button>
                      <button
                        onClick={() => handleResolutionChange('low')}
                        className={`px-3 py-1 rounded text-sm ${
                          settings.outputResolution === 'low'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        低 (1200px)
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">图像格式</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleImageFormatChange('png')}
                        className={`px-4 py-2 rounded text-sm ${
                          settings.imageFormat === 'png'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        PNG (无损)
                      </button>
                      <button
                        onClick={() => handleImageFormatChange('jpeg')}
                        className={`px-4 py-2 rounded text-sm ${
                          settings.imageFormat === 'jpeg'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        JPEG (小尺寸)
                      </button>
                    </div>
                  </div>
                  
                  {settings.imageFormat === 'jpeg' && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700">JPEG质量</label>
                      <input
                        type="range"
                        min="0.5"
                        max="1"
                        step="0.1"
                        value={settings.imageQuality}
                        onChange={(e) => handleQualityChange(e.target.value)}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500">{Math.round(settings.imageQuality * 100)}%</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleDownload}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-4"
                >
                  下载图片
                </button>
              </div>
            )}
          </div>

          <div className="w-full lg:w-2/3 xl:w-2/3 bg-white rounded-lg shadow overflow-hidden h-full">
            <div className="w-full h-full">
              <canvas
                ref={canvasRef}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;