import React from 'react';
import { useAuth } from '../App';
import CompanionPairing from '../components/Companion/CompanionPairing';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return <div className="text-white">Cargando...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-gray-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-blue-300 mb-4 text-center">Perfil de usuario</h2>
      <div className="flex flex-col items-center mb-6">
        <img
          src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=0D8ABC&color=fff`}
          alt="avatar"
          className="w-24 h-24 rounded-full border-4 border-blue-400 mb-2 shadow"
        />
        <div className="text-xl font-semibold text-white">{user.displayName || 'Sin nombre'}</div>
        <div className="text-gray-400">{user.email}</div>
      </div>
      <button
        onClick={logout}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-6 transition"
      >
        Cerrar sesión
      </button>
      <div className="mb-2">
        <h3 className="text-lg font-bold text-blue-200 mb-2">Compañero</h3>
        <CompanionPairing />
      </div>
    </div>
  );
}
