import React, { useState, useEffect } from 'react';
import ProgressPhotoUpload from './ProgressPhotoUpload';
import { getAuth } from 'firebase/auth';
import { saveMonthlyProgress, getMonthlyProgress } from '../../services/progress';
import { uploadMealPhoto } from '../../services/storage';
import dayjs from 'dayjs';

export default function ProgressForm({ mes }) {
  const user = getAuth().currentUser;
  const [peso, setPeso] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoUrl, setFotoUrl] = useState('');
  const [previewFoto, setPreviewFoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [yaRegistrado, setYaRegistrado] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFoto(null);
    setPreviewFoto('');
    getMonthlyProgress(user.uid, mes).then(data => {
      if (data) {
        setPeso(data.peso || '');
        setFotoUrl(data.foto || '');
        setYaRegistrado(true);
      } else {
        setPeso('');
        setFotoUrl('');
        setYaRegistrado(false);
      }
    });
  }, [user, mes]);
  


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Validación estricta: solo 1 registro por mes
    const existente = await getMonthlyProgress(user.uid, mes);
    if (existente) {
      setError('Ya registraste tu progreso este mes.');
      setYaRegistrado(true);
      setPeso(existente.peso || '');
      setFotoUrl(existente.foto || '');
      return;
    }
    if (!peso || isNaN(Number(peso))) {
      setError('Ingresa un peso válido.');
      return;
    }
    if (!foto) {
      setError('Sube una foto de progreso.');
      return;
    }
    setLoading(true);
    try {
      const url = await uploadMealPhoto(user.uid, mes, 'progreso', foto); // reutiliza lógica de storage
      await saveMonthlyProgress(user.uid, mes, { peso: Number(peso), foto: url });
      setSuccess('¡Progreso registrado!');
      setYaRegistrado(true);
      setFotoUrl(url);
    } catch (e) {
      setError('Error al guardar el progreso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded mb-4 max-w-md mx-auto bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 shadow-xl relative overflow-hidden" style={{minHeight: '22rem'}}>
      {/* Imagen de preview o guardada, cubre toda la card y está por encima */}
      {(previewFoto || fotoUrl) && (
        <img
          src={previewFoto || fotoUrl}
          alt="Foto progreso"
          className="absolute inset-0 w-full h-full object-cover rounded-2xl z-30"
          style={{ pointerEvents: 'none' }}
        />
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-full max-w-xs mx-auto bg-transparent p-4 rounded relative z-40"
      >
        <h3 className="text-lg font-bold mb-2 text-blue-200 text-center">Progreso mensual</h3>
        <label className="text-white">Peso (kg):
          <input type="number" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} className="rounded px-2 py-1 ml-2 text-black w-full" />
        </label>
        <label className="text-white">Foto progreso:</label>
        <ProgressPhotoUpload
          onFileChange={file => {
            console.log('Archivo seleccionado:', file);
            setFoto(file);
            if (file && file.type && file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onloadend = e => {
                console.log('Resultado FileReader:', e.target.result);
                setPreviewFoto(e.target.result);
              };
              reader.readAsDataURL(file);
            } else {
              setPreviewFoto('');
            }
          }}
          previewFoto={previewFoto}
          loading={loading}
          yaRegistrado={yaRegistrado}
        />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 mt-2 disabled:bg-gray-500 w-full" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar progreso'}
        </button>
        {success && <div className="text-green-400 text-center">{success}</div>}
        {error && <div className="text-red-400 text-center">{error}</div>}
      </form>
    </div>
  );
}
