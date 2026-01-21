import React from 'react';

export default function EmptyState({ title = 'Sin datos', description = '', illustration = 'habit' }) {
  // Puedes agregar más SVGs según la sección
  const illustrations = {
    habit: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto mb-2">
        <circle cx="40" cy="40" r="38" fill="#1e293b" stroke="#2563eb" strokeWidth="4" />
        <rect x="25" y="35" width="30" height="10" rx="5" fill="#2563eb" />
        <rect x="35" y="25" width="10" height="30" rx="5" fill="#2563eb" />
      </svg>
    ),
    meal: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto mb-2">
        <ellipse cx="40" cy="60" rx="25" ry="10" fill="#22c55e" />
        <circle cx="40" cy="40" r="20" fill="#facc15" />
        <rect x="36" y="20" width="8" height="20" rx="4" fill="#f59e42" />
      </svg>
    ),
    progress: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto mb-2">
        <rect x="20" y="60" width="40" height="10" rx="5" fill="#2563eb" />
        <rect x="30" y="40" width="20" height="20" rx="5" fill="#22c55e" />
        <rect x="35" y="20" width="10" height="20" rx="5" fill="#facc15" />
      </svg>
    ),
  };
  return (
    <div className="flex flex-col items-center justify-center py-8 opacity-80">
      {illustrations[illustration]}
      <div className="font-bold text-lg text-white mb-1">{title}</div>
      {description && <div className="text-sm text-white/80 text-center max-w-xs">{description}</div>}
    </div>
  );
}
