import React from 'react';

export default function AchievementBanner({ message, onClose }) {
  return (
    <div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-achievement-banner"
      style={{ minWidth: 320, maxWidth: 480, transition: 'all 0.6s cubic-bezier(.4,2,.3,1)' }}
      role="status"
      aria-live="polite"
    >
      <span role="img" aria-label="trofeo" className="text-2xl animate-bounce">🏆</span>
      <span className="font-bold text-lg drop-shadow-lg">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white text-xl font-bold focus:outline-none hover:text-yellow-300 transition"
        aria-label="Cerrar"
      >×</button>
    </div>
  );
}
