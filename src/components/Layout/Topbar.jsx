import React, { useState } from 'react';
import { useAuth } from '../../App';

import AppLogo from '../../assets/icons/AppLogo.jsx';
import CompanionAvatar from '../../assets/icons/CompanionAvatar.jsx';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <header
      className="w-full fixed top-[-180px] left-0 z-50 px-4 sm:px-6 flex items-center justify-between bg-blue-900 shadow-lg border-b-2 border-blue-700"
      style={{ minHeight: '56px', boxShadow: '0 2px 12px #1e293b33', paddingTop: '200px' }}
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
  );
}

// Agregar ThemeToggle al Topbar
import ThemeToggle from './ThemeToggle';

// ...existing code...

// En el header, agregar ThemeToggle junto al logo o al usuario
// (dentro del div de la derecha, después del menú de usuario)
