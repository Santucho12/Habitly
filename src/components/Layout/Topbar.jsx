
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import AppLogo from '../../assets/icons/AppLogo.jsx';
import CompanionAvatar from '../../assets/icons/CompanionAvatar.jsx';
import '../../styles/appTitleAnimation.css';
import ThemeToggle from './ThemeToggle';

function getAvatarUrl(user) {
  const url = user.photoURL
    ? user.photoURL
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=0D8ABC&color=fff`;
  if (url.includes('res.cloudinary.com')) {
    // Insertar transformación para thumbnail cuadrado centrado en la URL de Cloudinary
    return url.replace('/upload/', '/upload/c_thumb,g_face,w_200,h_200/');
  }
  return url;
}

export default function Topbar({ open, setOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setScrolled(scrollPercent > 0.2);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solidBg = '#111827';
  const gradientBg = 'linear-gradient(180deg, #2564eba6 5%, #1e3b8a00 95%)';
  return (
    <header
      className="w-full fixed top-0 left-0 z-[9999] px-6 flex items-center justify-between shadow-md"
      style={{
        minHeight: '7.3rem',
        background: scrolled ? solidBg : gradientBg,
        transition: 'background 1.5s cubic-bezier(.4,0,.2,1)'
      }}
      role="banner"
    >
      <div className="w-1/4 flex items-center" style={{marginTop: '20px'}}>
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
      <div className="w-1/2 flex justify-center" style={{marginTop: '20px'}}>
        <span
          className="font-extrabold text-3xl sm:text-4xl tracking-tight text-white drop-shadow-lg animate-app-title"
          style={{
            letterSpacing: '0.01em',
            textShadow: '0 4px 16px #1e293b66, 0 1px 0 #fff2',
            background: scrolled
              ? 'none'
              : 'linear-gradient(180deg, #2563eb 60%, #1e3a8a 100%)',
            color: scrolled ? '#fff' : undefined,
            WebkitBackgroundClip: scrolled ? undefined : 'text',
            WebkitTextFillColor: scrolled ? undefined : 'transparent',
            display: 'inline-block',
            padding: '0.1em 0.5em',
            borderRadius: '0.5em',
            boxShadow: '0 2px 12px #1e3a8a33',
            transition: 'all 0.7s cubic-bezier(.4,0,.2,1)'
          }}
        >
          Habitly
        </span>
      </div>
      <div className="w-1/4 flex justify-end items-center gap-2" style={{marginTop: '20px'}}>
        {user && (
          <img
            src={getAvatarUrl(user)}
            alt="avatar usuario"
            className="w-9 h-9 rounded-full border-2 border-blue-300 shadow-sm bg-white cursor-pointer"
            title={user.displayName || user.email}
            onClick={() => navigate('/profile')}
          />
        )}
      </div>
    </header>
  );
}


