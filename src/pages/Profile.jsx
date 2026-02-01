import React, { useRef, useState } from 'react';
import Pairing from './Pairing';
import { useAuth } from '../context/AuthContext';
// import CompanionPairing from '../components/Companion/CompanionPairing';
import { uploadProfilePhoto } from '../services/storage';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { updateProfile } from 'firebase/auth';

export default function Profile() {
  const { user, logout } = useAuth();
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [editError, setEditError] = useState('');

  if (!user) return <div className="text-white">Cargando...</div>;

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      // Subir a Firebase Storage (opcional, puedes comentar si solo quieres Cloudinary)
      // const firebaseUrl = await uploadProfilePhoto(user.uid, file);

      // Subir a Cloudinary
      const cloudinaryResult = await uploadImageToCloudinary(file);
      if (!cloudinaryResult.secure_url) throw new Error('Error al subir a Cloudinary');
      const url = cloudinaryResult.secure_url;
      await updateProfile(user, { photoURL: url });
      setPhotoURL(url);
    } catch (err) {
      setError('Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="w-[360px] mx-auto mt-10 bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-blue-300 mb-4 text-center">Perfil de usuario</h2>
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img
              src={photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=0D8ABC&color=fff`}
              alt="avatar"
              className="w-24 h-24 rounded-full border-4 border-blue-400 mb-2 shadow object-cover"
            />
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow transition-opacity opacity-80 group-hover:opacity-100"
              onClick={() => fileInputRef.current.click()}
              aria-label="Cambiar foto de perfil"
              disabled={uploading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 01.75-.75h9a.75.75 0 01.75.75v6a2.25 2.25 0 01-2.25 2.25H9A2.25 2.25 0 016.75 18v-6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3 3 0 100-6 3 3 0 000 6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 9.75V7.5A2.25 2.25 0 0014.25 5.25h-4.5A2.25 2.25 0 007.5 7.5v2.25" />
              </svg>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handlePhotoChange}
              disabled={uploading}
            />
          </div>
          {uploading && <div className="text-blue-400 text-xs mt-2">Subiendo foto...</div>}
          {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
          {!editing ? (
            <>
              <div className="text-xl font-semibold text-white mt-2">{user.displayName || 'Sin nombre'}</div>
              <div className="text-gray-400">{user.email}</div>
              <button
                className="mt-2 px-4 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
                onClick={() => setEditing(true)}
              >Editar perfil</button>
            </>
          ) : (
            <form
              className="flex flex-col items-center gap-2 mt-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setEditError('');
                try {
                  await updateProfile(user, { displayName: newName });
                  // Para email, se requiere reautenticación en Firebase, aquí solo se muestra el campo
                  setEditing(false);
                } catch (err) {
                  setEditError('Error al actualizar perfil');
                }
              }}
            >
              <input
                className="px-2 py-1 rounded bg-gray-700 text-white w-40"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nombre"
              />
              <input
                className="px-2 py-1 rounded bg-gray-700 text-white w-40"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="Email"
                disabled
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Guardar</button>
              <button type="button" className="text-gray-400 mt-1" onClick={() => setEditing(false)}>Cancelar</button>
              {editError && <div className="text-red-400 text-xs mt-1">{editError}</div>}
            </form>
          )}
          <div className="text-xs text-gray-400 mt-2">Fecha de registro: {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '-'}</div>
        </div>
        <button
          onClick={logout}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg shadow-md mb-6 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
        >
          Cerrar sesión
        </button>
      </div>
      <div className="w-full mt-8 flex justify-center">
        <div className="flex flex-col items-center justify-center w-full" style={{ minHeight: 480 }}>
          <Pairing />
        </div>
      </div>
    </>
  );
}
