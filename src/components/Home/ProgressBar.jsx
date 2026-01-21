import React from 'react';

export default function ProgressBar({ value, max = 100, color = 'bg-blue-500', label }) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full my-2">
      {label && <div className="text-xs mb-1 text-white/80 font-semibold">{label}</div>}
      <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-4 ${color} rounded-full transition-all duration-700 ease-out animate-progress-bar`}
          style={{ width: percent + '%' }}
          aria-valuenow={value}
          aria-valuemax={max}
          role="progressbar"
        />
      </div>
      <div className="text-xs text-right text-white/60 mt-1">{percent}%</div>
    </div>
  );
}
