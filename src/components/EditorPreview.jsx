import React from 'react';

function EditorPreview({ canvasRef, hasImage, dimensions, watermarkStyleName }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200/80 bg-white px-4 py-3 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-800">实时预览</h2>
          <p className="text-xs text-zinc-400">调整参数后自动更新</p>
        </div>
        {hasImage && dimensions.width > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
              {dimensions.width} × {dimensions.height}
            </span>
            {watermarkStyleName && (
              <span className="rounded-full bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent">
                {watermarkStyleName}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="preview-grid flex flex-1 items-center justify-center overflow-auto p-4 sm:p-8">
        {hasImage ? (
          <div className="w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-panel">
            <canvas ref={canvasRef} className="block w-full h-auto" />
          </div>
        ) : (
          <div className="flex max-w-sm flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-panel">
              <svg className="h-8 w-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-600">尚未上传图片</p>
            <p className="mt-1 text-xs text-zinc-400">在左侧面板上传照片，即可预览水印效果</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditorPreview;
