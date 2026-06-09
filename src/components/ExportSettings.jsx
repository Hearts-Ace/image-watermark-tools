import React from 'react';
import { OUTPUT_RESOLUTIONS } from '../constants/settings.js';
import RangeSlider from './ui/RangeSlider';
import SectionCard from './ui/SectionCard';
import SegmentedControl from './ui/SegmentedControl';
import Switch from './ui/Switch';

function ExportSettings({
  settings,
  updateSetting,
  originalImageDimensions,
  onDownload,
  isExporting = false,
}) {
  const resolutionOptions = Object.entries(OUTPUT_RESOLUTIONS).map(([value, preset]) => ({
    value,
    label: preset.label,
  }));

  return (
    <div className="space-y-4">
      <SectionCard title="导出尺寸" description="导出时使用独立离屏渲染，不受页面缩放影响">
        {originalImageDimensions.width > 0 && (
          <div className="mb-4 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
            原图：
            <span className="ml-1 font-semibold tabular-nums text-zinc-700">
              {originalImageDimensions.width} × {originalImageDimensions.height}
            </span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500">输出分辨率</label>
            <SegmentedControl
              options={resolutionOptions}
              value={settings.outputResolution}
              onChange={(value) => updateSetting('outputResolution', value)}
            />
          </div>

          <RangeSlider
            label="Logo 大小"
            value={settings.logoSize}
            min={0.5}
            max={2}
            step={0.1}
            onChange={(value) => updateSetting('logoSize', parseFloat(value))}
            formatValue={(value) => `${Math.round(value * 100)}%`}
          />

          <RangeSlider
            label="文字大小"
            value={settings.textSize}
            min={0.5}
            max={2}
            step={0.1}
            onChange={(value) => updateSetting('textSize', parseFloat(value))}
            formatValue={(value) => `${Math.round(value * 100)}%`}
          />
        </div>
      </SectionCard>

      <SectionCard title="文件格式">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500">图像格式</label>
            <SegmentedControl
              size="md"
              options={[
                { value: 'png', label: 'PNG 无损' },
                { value: 'jpeg', label: 'JPEG 压缩' },
              ]}
              value={settings.imageFormat}
              onChange={(value) => updateSetting('imageFormat', value)}
            />
          </div>

          {settings.imageFormat === 'jpeg' && (
            <RangeSlider
              label="JPEG 质量"
              value={settings.imageQuality}
              min={0.5}
              max={1}
              step={0.1}
              onChange={(value) => updateSetting('imageQuality', parseFloat(value))}
              formatValue={(value) => `${Math.round(value * 100)}%`}
            />
          )}
        </div>
      </SectionCard>

      <SectionCard title="色彩条" description="从照片中部采样 5 个平均色">
        <div className="space-y-4">
          <Switch
            label="显示色彩条"
            checked={settings.showColorStrip}
            onChange={(value) => updateSetting('showColorStrip', value)}
          />

          {settings.showColorStrip && (
            <>
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-500">位置</label>
                <SegmentedControl
                  options={[
                    { value: 'left', label: '左上' },
                    { value: 'right', label: '右上' },
                  ]}
                  value={settings.colorStripPosition}
                  onChange={(value) => updateSetting('colorStripPosition', value)}
                />
              </div>

              <RangeSlider
                label="色彩条长度"
                value={settings.colorStripLength}
                min={0.2}
                max={1}
                step={0.05}
                onChange={(value) => updateSetting('colorStripLength', parseFloat(value))}
                formatValue={(value) => `${Math.round(value * 100)}%`}
              />

              <RangeSlider
                label="距顶部高度"
                value={settings.colorStripTopOffset}
                min={0}
                max={300}
                step={1}
                onChange={(value) => updateSetting('colorStripTopOffset', parseInt(value, 10))}
                formatValue={(value) => `${value}px`}
              />
            </>
          )}
        </div>
      </SectionCard>

      <button
        type="button"
        onClick={onDownload}
        disabled={isExporting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            导出中...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            下载图片
          </>
        )}
      </button>
    </div>
  );
}

export default ExportSettings;
