import React, { useRef, useState } from 'react';

function ImageUpload({ onFileSelect, hasImage }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`group cursor-pointer rounded-xl border-2 border-dashed p-5 transition-all ${
        isDragging
          ? 'border-accent bg-accent-muted'
          : hasImage
            ? 'border-zinc-200 bg-zinc-50 hover:border-accent/50 hover:bg-accent-muted/50'
            : 'border-zinc-300 bg-white hover:border-accent hover:bg-accent-muted/30'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
          isDragging ? 'bg-accent text-white' : 'bg-zinc-100 text-zinc-500 group-hover:bg-accent/10 group-hover:text-accent'
        }`}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-800">
            {hasImage ? '更换图片' : '上传照片'}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">
            点击或拖拽 JPG / PNG / WebP
          </p>
        </div>
      </div>
    </div>
  );
}

export default ImageUpload;
