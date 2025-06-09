// src/components/Controls.jsx
import React from 'react';

function Controls({ settings, setSettings }) {
  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: parseInt(value, 10)
    }));
  };

  const handleTextChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBrandChange = (brand) => {
    setSettings(prev => ({
      ...prev,
      selectedBrand: brand
    }));
  };

  // 重置相机信息
  const resetCameraInfo = () => {
    setSettings(prev => ({
      ...prev,
      cameraModel: '',
      lensModel: '',
      focalLength: '',
      aperture: '',
      shutterSpeed: '',
      iso: '',
      customDate: ''
    }));
    
    // 清除localStorage中的缓存
    try {
      localStorage.removeItem('photoEditorCameraInfo');
    } catch (error) {
      console.error('Error clearing camera info cache:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-800">Border Settings</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Top Border</label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.topBorder}
          onChange={(e) => handleChange('topBorder', e.target.value)}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{settings.topBorder}px</span>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Right Border</label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.rightBorder}
          onChange={(e) => handleChange('rightBorder', e.target.value)}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{settings.rightBorder}px</span>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Bottom Border</label>
        <input
          type="range"
          min="0"
          max="200"
          value={settings.bottomBorder}
          onChange={(e) => handleChange('bottomBorder', e.target.value)}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{settings.bottomBorder}px</span>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Left Border</label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.leftBorder}
          onChange={(e) => handleChange('leftBorder', e.target.value)}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{settings.leftBorder}px</span>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Border Radius</label>
        <input
          type="range"
          min="0"
          max="50"
          value={settings.borderRadius}
          onChange={(e) => handleChange('borderRadius', e.target.value)}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{settings.borderRadius}px</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo</label>
        <div className="flex gap-4">
          {['sony', 'fuji', 'canon', 'nikon'].map((brand) => (
            <button
              key={brand}
              onClick={() => handleBrandChange(brand)}
              className={`px-4 py-2 rounded ${
                settings.selectedBrand === brand
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {brand.charAt(0).toUpperCase() + brand.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-800">相机信息设置</h3>
          <button 
            onClick={resetCameraInfo}
            className="text-sm text-red-500 hover:text-red-700"
          >
            重置信息
          </button>
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">相机型号</label>
          <input
            type="text"
            value={settings.cameraModel}
            onChange={(e) => handleTextChange('cameraModel', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            placeholder="例如: Sony A7IV"
          />
        </div>
        
        {/* 镜头型号输入框 - 仅在双行水印模式下显示 */}
        {settings.watermarkStyle === 'dualLine' && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">镜头型号</label>
            <input
              type="text"
              value={settings.lensModel}
              onChange={(e) => handleTextChange('lensModel', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="例如: FE 35mm F1.8"
            />
          </div>
        )}
        
        {/* 自定义日期输入框 - 仅在双行水印模式下显示 */}
        {settings.watermarkStyle === 'dualLine' && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">自定义日期</label>
            <input
              type="text"
              value={settings.customDate}
              onChange={(e) => handleTextChange('customDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="例如: 2023年12月31日"
            />
            <p className="text-xs text-gray-500 mt-1">留空则显示当前日期</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">焦距 (mm)</label>
            <input
              type="text"
              value={settings.focalLength}
              onChange={(e) => handleTextChange('focalLength', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="例如: 50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">光圈</label>
            <input
              type="text"
              value={settings.aperture}
              onChange={(e) => handleTextChange('aperture', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="例如: 1.8"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">快门速度</label>
            <input
              type="text"
              value={settings.shutterSpeed}
              onChange={(e) => handleTextChange('shutterSpeed', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="例如: 125"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">ISO</label>
            <input
              type="text"
              value={settings.iso}
              onChange={(e) => handleTextChange('iso', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="例如: 100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Controls;