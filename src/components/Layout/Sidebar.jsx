import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const menu = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '✅', label: 'Check-list', path: '/checklist' },
    { icon: '🍽️', label: 'Comidas', path: '/meals' },
    { icon: '📈', label: 'Progreso', path: '/progress' },
    { icon: '🏆', label: 'Ranking', path: '/ranking' },
    { icon: '📊', label: 'Estadísticas', path: '/stats' },
    { icon: '🥇', label: 'Logros', path: '/achievements' },
    { icon: '👤', label: 'Perfil', path: '/profile' },
  ];
  return (
    <aside className="bg-gray-900 text-white w-20 min-h-screen flex flex-col items-center py-6 shadow-lg fade-in" role="navigation" aria-label="Menú principal">
      <div className="flex-1 flex flex-col gap-8 items-center justify-center">
        {menu.map((item, idx) => (
          <button
            key={item.path}
            title={item.label}
            onClick={() => navigate(item.path)}
            className={`sidebar-btn text-2xl hover:text-blue-400 ${location.pathname === item.path ? 'selected text-blue-400 font-bold' : ''}`}
            aria-label={item.label}
            aria-current={location.pathname === item.path ? 'page' : undefined}
            tabIndex={0}
            role="menuitem"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate(item.path);
              }
              // Arrow key navigation
              if (e.key === 'ArrowDown') {
                const next = document.querySelectorAll('.sidebar-btn')[idx + 1];
                if (next) next.focus();
              }
              if (e.key === 'ArrowUp') {
                const prev = document.querySelectorAll('.sidebar-btn')[idx - 1];
                if (prev) prev.focus();
              }
            }}
          >
            {item.icon}
          </button>
        ))}
      </div>
      {children}
    </aside>
  );
}
