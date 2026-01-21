import React from 'react';

export default function SummaryCard({ title, value, icon, color = 'bg-blue-700', children }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl shadow-lg p-4 min-w-[120px] min-h-[100px] ${color} text-white relative animate-fade-in`}
      role="status"
      aria-label={title}
    >
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-sm opacity-80 mb-1">{title}</div>
      {children}
    </div>
  );
}
