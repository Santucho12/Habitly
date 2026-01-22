import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  // Obtener el nombre de la actividad según la ruta
  const routeNames = {
    '/': 'Home',
    '/checklist': 'Check-list',
    '/meals': 'Comidas',
    '/progress': 'Progreso',
    // '/ranking': 'Ranking',
    '/stats': 'Estadísticas',
    '/achievements': 'Logros',
    '/profile': 'Perfil',
  };
  const activityName = routeNames[location.pathname] || '';
  return (
    <div className="flex min-h-screen bg-gray-900 overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 overflow-y-auto bg-gray-900">
          <div className="max-w-md mx-auto">
            {activityName && (
              <h1 className="text-2xl font-bold mb-6 text-white">{activityName}</h1>
            )}
            <div key={location.pathname} className="transition-all duration-500 ease-in-out animate-fadein">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
