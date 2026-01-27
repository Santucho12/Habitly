import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="relative flex min-h-screen overflow-x-hidden">
      {/* Video de fondo global */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none select-none scale-150 md:scale-100 transition-transform duration-500"
        style={{ opacity: 0.8, transform: 'scale(2)' }}
        src="/assets/video/YTDown.com_YouTube_4k-blue-technology-particle-light-title_Media_Nfvk2DTF4wo_001_1080p.mp4"
      />
      {/* Capa para oscurecer el video y mejorar legibilidad */}
      <div className="fixed inset-0 bg-black/80 z-10 pointer-events-none select-none" />
      {/* Sidebar y Topbar en la raíz visual */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <Topbar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="relative flex-1 flex flex-col z-20 w-full">
        <main
          className="flex-1 p-4 overflow-y-auto"
          style={{
            paddingTop: '7.3rem'
          }}
        >
          {activityName && (
            <h1
              className="text-2xl font-bold mb-6 text-white"
              style={['Check-list','Comidas','Estadísticas','Progreso','Logros','Perfil'].includes(activityName) ? { marginTop: '30px' } : {}}
            >
              {activityName}
            </h1>
          )}
          <div key={location.pathname} className="transition-all duration-500 ease-in-out animate-fadein">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
