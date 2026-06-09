import React from 'react';

function RangeSlider({ label, value, min, max, step, onChange, formatValue, className = '' }) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-zinc-600">{label}</label>
        <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-zinc-700">
          {formatValue(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="range-accent"
      />
    </div>
  );
}

export default RangeSlider;
