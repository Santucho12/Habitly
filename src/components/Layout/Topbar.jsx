import React, { useState } from 'react';
import { useAuth } from '../../App';

import AppLogo from '../../assets/icons/AppLogo.jsx';
import CompanionAvatar from '../../assets/icons/CompanionAvatar.jsx';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-blue-900 text-white w-full py-4 px-6 flex items-center justify-between shadow" role="banner">
      <div className="flex items-center gap-3">
        <AppLogo size={36} />
        <span className="font-bold text-lg tracking-wide">Habitly</span>
        <span className="ml-2"><CompanionAvatar size={32} /></span>
      </div>
      {user && (
        <div className="relative flex items-center">
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú de usuario"
            aria-haspopup="true"
            aria-expanded={open}
            tabIndex={0}
          >
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=0D8ABC&color=fff`}
              alt="avatar usuario"
              className="w-8 h-8 rounded-full border-2 border-blue-300"
            />
            <span className="hidden sm:inline font-semibold text-white text-base">{user.displayName || user.email}</span>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-gray-900 rounded shadow-lg z-50 fade-in" role="menu" aria-label="Opciones de usuario">
              <div className="px-4 py-2 border-b font-semibold">{user.displayName || user.email}</div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 hover:bg-blue-100 rounded-b"
                role="menuitem"
                tabIndex={0}
              >Cerrar sesión</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

// Agregar ThemeToggle al Topbar
import ThemeToggle from './ThemeToggle';

// ...existing code...

// En el header, agregar ThemeToggle junto al logo o al usuario
// (dentro del div de la derecha, después del menú de usuario)
