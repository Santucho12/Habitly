import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ open, setOpen, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const menu = [
    { icon: '🏠', label: 'Home', path: '/comparativo' },
    { icon: '✅', label: 'Check-list', path: '/checklist' },
    { icon: '🍽️', label: 'Comidas', path: '/meals' },
    { icon: '📈', label: 'Progreso', path: '/progress' },
    // { icon: '🏆', label: 'Ranking', path: '/ranking' },
    { icon: '📊', label: 'Estadísticas', path: '/stats' },
    { icon: '🥇', label: 'Logros', path: '/achievements' },
    { icon: '👤', label: 'Perfil', path: '/profile' },
  ];

  // El sidebar está oculto (translate-x-[-100%]) cuando open es false
  return (
    <>
      {/* Sidebar deslizante */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-gray-900 text-white w-20 shadow-lg fade-in transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        role="navigation"
        aria-label="Menú principal"
      >
        <div className="flex flex-col gap-4 items-center justify-center w-full mt-16">
          {menu.map((item, idx) => (
            <button
              key={item.path}
              title={item.label}
              onClick={() => { navigate(item.path); setOpen(false); }}
              className={`sidebar-btn flex flex-col items-center w-full py-2 text-2xl hover:text-blue-400 ${location.pathname === item.path ? 'selected text-blue-400 font-bold' : ''}`}
              aria-label={item.label}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              tabIndex={0}
              role="menuitem"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(item.path);
                  setOpen(false);
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
              <span>{item.icon}</span>
              <span className="text-xs mt-1 font-medium whitespace-nowrap text-center w-full" style={{lineHeight:'1.1'}}>{item.label}</span>
            </button>
          ))}
        </div>
        {children}
      </aside>
    </>
  );
}
