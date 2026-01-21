import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { saveMonthlyProgress, getMonthlyProgress } from '../../services/progress';
import { uploadMealPhoto } from '../../services/storage';
import dayjs from 'dayjs';

export default function ProgressForm({ mes }) {
  const user = getAuth().currentUser;
  const [peso, setPeso] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoUrl, setFotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [yaRegistrado, setYaRegistrado] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMonthlyProgress(user.uid, mes).then(data => {
      if (data) {
        setPeso(data.peso || '');
        setFotoUrl(data.foto || '');
        setYaRegistrado(true);
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
    <div className="bg-gray-800 p-4 rounded mb-4 max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-2">Progreso mensual</h3>
      {yaRegistrado && fotoUrl && (
        <div className="mb-2">
          <img src={fotoUrl} alt="Foto progreso" className="w-32 h-32 object-cover rounded mx-auto" />
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label>Peso (kg):
          <input type="number" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} disabled={yaRegistrado} className="rounded px-2 py-1 ml-2 text-black" />
        </label>
        <label>Foto progreso:
          <input type="file" accept="image/*" onChange={e => setFoto(e.target.files[0])} disabled={yaRegistrado} className="ml-2" />
        </label>
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 mt-2 disabled:bg-gray-500" disabled={loading || yaRegistrado}>
          {yaRegistrado ? 'Ya registrado' : loading ? 'Guardando...' : 'Guardar progreso'}
        </button>
        {success && <div className="text-green-400">{success}</div>}
        {error && <div className="text-red-400">{error}</div>}
      </form>
    </div>
  );
}
