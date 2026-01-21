import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

export default function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center bg-gray-900 border-t border-gray-800 py-2 md:hidden" role="navigation" aria-label="Menú inferior">
      {menu.map((item, idx) => (
        <button
          key={item.path}
          title={item.label}
          onClick={() => navigate(item.path)}
          className={`sidebar-btn text-2xl flex flex-col items-center ${location.pathname === item.path ? 'selected text-blue-400 font-bold' : ''}`}
          aria-label={item.label}
          aria-current={location.pathname === item.path ? 'page' : undefined}
          tabIndex={0}
          role="menuitem"
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate(item.path);
            }
            // Arrow key navigation
            if (e.key === 'ArrowRight') {
              const next = document.querySelectorAll('.sidebar-btn')[idx + 1];
              if (next) next.focus();
            }
            if (e.key === 'ArrowLeft') {
              const prev = document.querySelectorAll('.sidebar-btn')[idx - 1];
              if (prev) prev.focus();
            }
          }}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
