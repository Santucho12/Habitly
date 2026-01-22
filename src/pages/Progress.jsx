import React, { useState, useEffect } from 'react';
import AchievementBanner from '../components/Achievements/AchievementBanner';
import ProgressChart from '../components/Progress/ProgressChart';
import ProgressPhotoCompare from '../components/Progress/ProgressPhotoCompare';
import { getAuth } from 'firebase/auth';
import { saveMonthlyProgress, getMonthlyProgress } from '../services/progress';
import { uploadMealPhoto } from '../services/storage';
import dayjs from 'dayjs';


export default function ProgressPage() {
  const user = getAuth().currentUser;
  const mes = dayjs().format('YYYY-MM');
  const [peso, setPeso] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoUrl, setFotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [yaRegistrado, setYaRegistrado] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMonthlyProgress(user.uid, mes).then(data => {
      if (data) {
        setPeso(data.peso || '');
        setFotoUrl(data.foto || '');
        setYaRegistrado(true);
      }
    });
    // eslint-disable-next-line
  }, [user, mes]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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
      const url = await uploadMealPhoto(user.uid, mes, 'progreso', foto);
      await saveMonthlyProgress(user.uid, mes, { peso: Number(peso), foto: url });
      setSuccess('¡Progreso registrado!');
      setYaRegistrado(true);
      setFotoUrl(url);
      setShowBanner(true);
    } catch (e) {
      setError('Error al guardar el progreso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showBanner && <AchievementBanner message="¡Progreso mensual registrado!" onClose={() => setShowBanner(false)} />}
      <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-2 sm:p-6 mt-4 sm:mt-8" role="form" aria-labelledby="progress-title">
        <h2 id="progress-title" className="text-2xl font-bold text-blue-300 mb-2 text-center">Progreso mensual</h2>
        <div className="text-center text-blue-200 font-bold mb-4 text-lg">
          Mes actual: {dayjs(mes).format('MMMM YYYY')}
        </div>
        {/* Carrusel de fotos y pesos históricos */}
        <ProgressPhotoCompare />
        {/* Formulario de registro mensual */}
        {!yaRegistrado && (
          <div className="text-gray-400 text-center mt-8">
            <div className="font-semibold">¡Aún no registraste tu progreso este mes!</div>
            <div className="text-sm text-gray-400">Sube tu peso y foto para ver tu avance.</div>
          </div>
        )}
        {yaRegistrado && fotoUrl && (
          <div className="mb-4 flex flex-col items-center">
            <img src={fotoUrl} alt="Foto progreso" className="w-32 h-32 object-cover rounded-xl border border-gray-600" />
            <div className="text-sm text-gray-300 mt-2">Foto de este mes</div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" aria-describedby="progress-desc">
          <span id="progress-desc" className="sr-only">Formulario para registrar tu peso y foto de progreso mensual</span>
          <label className="font-semibold" htmlFor="peso-input">Peso (kg):</label>
          <input
            id="peso-input"
            type="number"
            step="0.1"
            value={peso}
            onChange={e => setPeso(e.target.value)}
            disabled={yaRegistrado}
            className="rounded px-2 py-2 text-black w-full"
            aria-label="Peso en kilogramos"
            tabIndex={0}
          />
          <label className="font-semibold" htmlFor="foto-input">Foto progreso:</label>
          <input
            id="foto-input"
            type="file"
            accept="image/*"
            onChange={e => setFoto(e.target.files[0])}
            disabled={yaRegistrado}
            className="w-full"
            aria-label="Subir foto de progreso"
            tabIndex={0}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-xl px-2 py-2 mt-2 font-bold text-lg hover:bg-blue-700 disabled:bg-gray-500 transition w-full"
            disabled={loading || yaRegistrado}
            aria-label={yaRegistrado ? 'Ya registrado' : loading ? 'Guardando progreso' : 'Guardar progreso'}
            tabIndex={0}
          >
            {yaRegistrado ? 'Ya registrado' : loading ? 'Guardando...' : 'Guardar progreso'}
          </button>
          <div aria-live="polite" aria-atomic="true">
            {success && <div className="text-green-400 text-center font-semibold" role="status">{success}</div>}
            {error && <div className="text-red-400 text-center font-semibold" role="alert">{error}</div>}
          </div>
        </form>
        {/* Gráfica de evolución de peso */}
        <ProgressChart />
      </div>
    </>
  );
}
