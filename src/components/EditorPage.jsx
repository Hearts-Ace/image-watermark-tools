import React, { useEffect, useRef, useState } from 'react';
import Controls from './Controls';
import EditorPreview from './EditorPreview';
import ExportSettings from './ExportSettings';
import ImageUpload from './ImageUpload';
import WatermarkStyles from './WatermarkStyles';
import SidebarTabs from './ui/SidebarTabs';
import processImage, { exportProcessedImage } from '../utils/ImageProcessor';
import { getWatermarkStyle } from '../watermarks/index.js';

const SIDEBAR_TABS = [
  { id: 'style', label: '样式' },
  { id: 'border', label: '边框' },
  { id: 'info', label: '参数' },
  { id: 'export', label: '导出' },
];

function EditorPage({
  settings,
  setSettings,
  updateSetting,
  image,
  exifData,
  originalImageDimensions,
  processFile,
}) {
  const canvasRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('style');

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    processImage(canvasRef.current, image, settings, exifData, { mode: 'preview' }).catch((error) => {
      console.error('Error processing image:', error);
    });
  }, [image, settings, exifData]);

  const handleDownload = async () => {
    if (!image || isExporting) return;

    setIsExporting(true);
    try {
      const blob = await exportProcessedImage(image, settings, exifData);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `processed-image.${settings.imageFormat === 'jpeg' ? 'jpg' : 'png'}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const watermarkStyleName = getWatermarkStyle(settings.watermarkStyle).name;

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col lg:min-h-[calc(100vh-57px)] lg:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-zinc-200/80 bg-white lg:w-[400px] lg:border-b-0 lg:border-r xl:w-[420px]">
        <div className="space-y-4 p-4 sm:p-5">
          <ImageUpload onFileSelect={processFile} hasImage={!!image} />
          <SidebarTabs tabs={SIDEBAR_TABS} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-5 sm:px-5 lg:max-h-[calc(100vh-220px)]">
          {activeTab === 'style' && (
            <>
              <WatermarkStyles
                selectedStyle={settings.watermarkStyle}
                onStyleChange={(style) => updateSetting('watermarkStyle', style)}
              />
              <Controls settings={settings} setSettings={setSettings} activeSection="style" />
            </>
          )}

          {activeTab === 'border' && (
            <Controls settings={settings} setSettings={setSettings} activeSection="border" />
          )}

          {activeTab === 'info' && (
            <Controls settings={settings} setSettings={setSettings} activeSection="info" />
          )}

          {activeTab === 'export' && image && (
            <ExportSettings
              settings={settings}
              updateSetting={updateSetting}
              originalImageDimensions={originalImageDimensions}
              onDownload={handleDownload}
              isExporting={isExporting}
            />
          )}

          {activeTab === 'export' && !image && (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center">
              <p className="text-sm text-zinc-500">请先上传图片后再导出</p>
            </div>
          )}
        </div>
      </aside>

      <EditorPreview
        canvasRef={canvasRef}
        hasImage={!!image}
        dimensions={originalImageDimensions}
        watermarkStyleName={image ? watermarkStyleName : null}
      />
    </div>
  );
}

export default EditorPage;
