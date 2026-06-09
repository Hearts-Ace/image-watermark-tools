import React from 'react';
import { BRANDS } from '../constants/brands.js';
import { clearCameraInfoCache } from '../utils/storage.js';
import { getExtraFieldsForStyle } from '../watermarks/index.js';
import RangeSlider from './ui/RangeSlider';
import SectionCard from './ui/SectionCard';
import Switch from './ui/Switch';

const BORDER_FIELDS = [
  { field: 'topBorder', label: '上边框', max: 100 },
  { field: 'rightBorder', label: '右边框', max: 100 },
  { field: 'bottomBorder', label: '下边框', max: 200 },
  { field: 'leftBorder', label: '左边框', max: 100 },
];

function Controls({ settings, setSettings, activeSection }) {
  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: parseInt(value, 10),
    }));
  };

  const handleTextChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetCameraInfo = () => {
    setSettings((prev) => ({
      ...prev,
      cameraModel: '',
      lensModel: '',
      focalLength: '',
      aperture: '',
      shutterSpeed: '',
      iso: '',
      customDate: '',
    }));
    clearCameraInfoCache();
  };

  const extraFields = getExtraFieldsForStyle(settings.watermarkStyle);

  if (activeSection === 'style') {
    return (
      <SectionCard title="品牌 Logo" description="选择相机品牌标识">
        <div className="grid grid-cols-3 gap-2">
          {BRANDS.map((brand) => {
            const active = settings.selectedBrand === brand.id;
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, selectedBrand: brand.id }))}
                className={`rounded-lg border px-2 py-2.5 text-xs font-semibold transition-all ${
                  active
                    ? 'border-accent bg-accent-muted text-accent shadow-sm'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                {brand.label}
              </button>
            );
          })}
        </div>
      </SectionCard>
    );
  }

  if (activeSection === 'border') {
    return (
      <div className="space-y-4">
        <SectionCard title="边框尺寸" description="单位：像素（预览时自动缩放）">
          <div className="space-y-4">
            {BORDER_FIELDS.map(({ field, label, max }) => (
              <RangeSlider
                key={field}
                label={label}
                value={settings[field]}
                min={0}
                max={max}
                step={1}
                onChange={(value) => handleChange(field, value)}
                formatValue={(value) => `${value}px`}
              />
            ))}
            <RangeSlider
              label="圆角"
              value={settings.borderRadius}
              min={0}
              max={50}
              step={1}
              onChange={(value) => handleChange('borderRadius', value)}
              formatValue={(value) => `${value}px`}
            />
          </div>
        </SectionCard>

        <SectionCard title="变换与效果">
          <div className="space-y-4">
            <RangeSlider
              label="图片旋转"
              value={settings.rotationAngle || 0}
              min={-45}
              max={45}
              step={1}
              onChange={(value) => handleChange('rotationAngle', value)}
              formatValue={(value) => `${value}°`}
            />
            <Switch
              label="照片阴影"
              description="为照片添加柔和投影"
              checked={settings.showPhotoShadow}
              onChange={(value) => setSettings((prev) => ({ ...prev, showPhotoShadow: value }))}
            />
          </div>
        </SectionCard>
      </div>
    );
  }

  if (activeSection === 'info') {
    return (
      <SectionCard
        title="拍摄参数"
        description="自动读取 EXIF，也可手动修改"
        action={
          <button
            type="button"
            onClick={resetCameraInfo}
            className="text-xs font-medium text-red-500 hover:text-red-600"
          >
            重置
          </button>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">相机型号</label>
            <input
              type="text"
              value={settings.cameraModel}
              onChange={(e) => handleTextChange('cameraModel', e.target.value)}
              className="input-field"
              placeholder="例如: Sony A7IV"
            />
          </div>

          {extraFields.includes('lensModel') && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">镜头型号</label>
              <input
                type="text"
                value={settings.lensModel}
                onChange={(e) => handleTextChange('lensModel', e.target.value)}
                className="input-field"
                placeholder="例如: FE 35mm F1.8"
              />
            </div>
          )}

          {extraFields.includes('customDate') && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">自定义日期</label>
              <input
                type="text"
                value={settings.customDate}
                onChange={(e) => handleTextChange('customDate', e.target.value)}
                className="input-field"
                placeholder="例如: 2023年12月31日"
              />
              <p className="mt-1 text-xs text-zinc-400">留空则显示当前日期</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { field: 'focalLength', label: '焦距 (mm)', placeholder: '50' },
              { field: 'aperture', label: '光圈', placeholder: '1.8' },
              { field: 'shutterSpeed', label: '快门速度', placeholder: '125' },
              { field: 'iso', label: 'ISO', placeholder: '100' },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500">{label}</label>
                <input
                  type="text"
                  value={settings[field]}
                  onChange={(e) => handleTextChange(field, e.target.value)}
                  className="input-field"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    );
  }

  return null;
}

export default Controls;
