import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import TabBar from './TabBar';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 overflow-y-auto bg-gray-900">
          <div key={location.pathname} className="transition-all duration-500 ease-in-out animate-fadein">
            {children}
          </div>
        </main>
        <TabBar />
      </div>
    </div>
  );
}
