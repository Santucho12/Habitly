import React, { useState } from 'react';
import { useAuth } from '../../App';

import AppLogo from '../../assets/icons/AppLogo.jsx';
import CompanionAvatar from '../../assets/icons/CompanionAvatar.jsx';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Status bar simulada */}
      <div className="w-full fixed top-0 left-0 z-50 bg-blue-900 flex items-center justify-between px-4" style={{ height: '28px' }}>
        <span className="text-white text-xs font-mono tracking-widest">13:03 <span role="img" aria-label="clock">🕒</span></span>
        <div className="flex items-center gap-2">
          <span className="text-white text-xs"></span>
          <span className="text-white text-xs">WiFi</span>
          <span className="text-yellow-300 text-xs bg-gray-900 rounded px-1">20</span>
        </div>
      </div>
      <header
        className="w-full fixed left-0 z-50 px-4 sm:px-6 flex items-center justify-between bg-blue-900 shadow-lg border-b-2 border-blue-700"
        style={{ minHeight: '56px', top: '28px', boxShadow: '0 2px 12px #1e293b33' }}
        role="banner"
      >
        <div className="flex items-center min-w-[40px]">
          {/* Aquí podrías poner el menú hamburguesa si lo tienes */}
        </div>
        <div className="flex-1 flex justify-center">
          <span
            className="font-bold text-xl sm:text-2xl tracking-tight text-white px-3 py-1 rounded-lg bg-blue-800/80 shadow"
            style={{ letterSpacing: '0.01em', textShadow: '0 2px 8px #1e293b44' }}
          >
            Habitly
          </span>
        </div>
        <div className="flex items-center min-w-[40px] justify-end">
          {user && (
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=0D8ABC&color=fff`}
              alt="avatar usuario"
              className="w-9 h-9 rounded-full border-2 border-blue-300 shadow-sm bg-white"
              title={user.displayName || user.email}
            />
          )}
        </div>
      </header>
    </>
  );
}

// Agregar ThemeToggle al Topbar
import ThemeToggle from './ThemeToggle';

// ...existing code...

// En el header, agregar ThemeToggle junto al logo o al usuario
// (dentro del div de la derecha, después del menú de usuario)
