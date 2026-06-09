import React from 'react';
import { watermarkStyles } from '../watermarks/index.js';
import SectionCard from './ui/SectionCard';

function WatermarkStyles({ selectedStyle, onStyleChange }) {
  return (
    <SectionCard title="水印风格" description="选择底部信息排版方式">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {watermarkStyles.map((style) => {
          const active = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onStyleChange(style.id)}
              className={`rounded-xl border px-4 py-3 text-left transition-all ${
                active
                  ? 'border-accent bg-accent-muted shadow-glow'
                  : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-white'
              }`}
            >
              <p className={`text-sm font-semibold ${active ? 'text-accent' : 'text-zinc-800'}`}>
                {style.name}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {style.id === 'default' ? '单行居中 Logo' : '双行 + 竖线分隔'}
              </p>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

export default WatermarkStyles;
