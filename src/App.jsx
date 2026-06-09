import React, { useState } from 'react';
import AppHeader from './components/AppHeader';
import BokehTest from './components/BokehTest';
import EditorPage from './components/EditorPage';
import { useEditorSettings } from './hooks/useEditorSettings';
import { useImageUpload } from './hooks/useImageUpload';

const NAV_ITEMS = [
  { id: 'editor', label: '照片水印' },
  { id: 'bokeh', label: '焦外测试' },
];

function App() {
  const [currentPage, setCurrentPage] = useState('editor');
  const { settings, setSettings, updateSetting } = useEditorSettings();
  const { image, exifData, originalImageDimensions, processFile } = useImageUpload(setSettings);

  if (currentPage === 'bokeh') {
    return <BokehTest onExit={() => setCurrentPage('editor')} />;
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <AppHeader
        navItems={NAV_ITEMS}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <EditorPage
        settings={settings}
        setSettings={setSettings}
        updateSetting={updateSetting}
        image={image}
        exifData={exifData}
        originalImageDimensions={originalImageDimensions}
        processFile={processFile}
      />
    </div>
  );
}

export default App;
