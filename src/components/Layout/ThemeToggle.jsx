import React from 'react';
import { useTheme } from '../ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="ml-2 px-2 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 transition"
      aria-label={theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}
      title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
