import React, { useState } from 'react';
import { useAuth } from '../../App';

import AppLogo from '../../assets/icons/AppLogo.jsx';
import CompanionAvatar from '../../assets/icons/CompanionAvatar.jsx';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <header className="w-full fixed top-0 left-0 z-50 px-6 flex items-center justify-between bg-blue-900 shadow-md" style={{minHeight:'7rem'}} role="banner">
      <div className="w-1/4 flex items-center" style={{marginTop: '40px'}}>
        {/* Botón hamburguesa movido desde Sidebar */}
        <button
          className="p-2 rounded bg-gray-900 hover:bg-gray-800 focus:outline-none shadow-lg"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>
      </div>
      <div className="w-1/2 flex justify-center" style={{marginTop: '40px'}}>
        <span className="font-bold text-2xl sm:text-2xl tracking-tight text-white" style={{letterSpacing:'0.01em', textShadow:'0 2px 8px #1e293b44'}}>
          Habitly
        </span>
      </div>
      <div className="w-1/4 flex justify-end items-center" style={{marginTop: '40px'}}>
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
