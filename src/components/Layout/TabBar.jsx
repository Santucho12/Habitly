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

// Eliminado: TabBar ya no se usa, menú solo en el lateral
export default function TabBar() { return null; }
