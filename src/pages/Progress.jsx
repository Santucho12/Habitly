import React, { useState, useEffect } from 'react';
import AchievementBanner from '../components/Achievements/AchievementBanner';
import ProgressChart from '../components/Progress/ProgressChart';
import ProgressPhotoCompare from '../components/Progress/ProgressPhotoCompare';
import { getAuth } from 'firebase/auth';
import { saveMonthlyProgress, getMonthlyProgress } from '../services/progress';
import { uploadImageToCloudinary } from '../services/cloudinary';
import dayjs from 'dayjs';
import 'dayjs/locale/es';


export default function ProgressPage() {
  const user = getAuth().currentUser;
  const mes = dayjs().format('YYYY-MM');
  const [peso, setPeso] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoUrl, setFotoUrl] = useState('');
  const [previewFoto, setPreviewFoto] = useState('');
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
      const uploadResult = await uploadImageToCloudinary(foto);
      console.log('Cloudinary upload result:', uploadResult);
      if (!uploadResult.secure_url) {
        setError('Error Cloudinary: ' + (uploadResult.error?.message || JSON.stringify(uploadResult)));
        return;
      }
      const url = uploadResult.secure_url;
      await saveMonthlyProgress(user.uid, mes, { peso: Number(peso), foto: url });
      setSuccess('¡Progreso registrado!');
      setYaRegistrado(true);
      setFotoUrl(url);
      setShowBanner(true);
    } catch (e) {
      setError('Error al guardar el progreso: ' + (e.message || e.toString()));
      console.error('Error al guardar el progreso:', e);
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
          Mes actual: {dayjs(mes).locale('es').format('MMMM YYYY')}
        </div>
        {/* Carrusel de fotos y pesos históricos: ÚNICA visualización de fotos de progreso */}
        {!previewFoto && <ProgressPhotoCompare />}
        {/* Mensaje si no hay registro este mes */}
        {!yaRegistrado && (
          <div className="text-gray-400 text-center mt-8">
            <div className="font-semibold">¡Aún no registraste tu progreso este mes!</div>
            <div className="text-sm text-gray-400">Sube tu peso y foto para ver tu avance.</div>
          </div>
        )}
        {/* Eliminado el formulario de guardado de progreso debajo del carrusel */}
        {/* Gráfica de evolución de peso */}
        <ProgressChart />
      </div>
    </>
  );
}
