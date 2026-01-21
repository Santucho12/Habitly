import React, { useState, useEffect } from 'react';
import AchievementBanner from '../components/Achievements/AchievementBanner';
import EmptyState from '../components/EmptyState';
import { saveDailyMeals, getDailyMeals } from '../services/meals';
import { hasExceptionThisWeek } from '../services/mealsException';
import { uploadMealPhoto } from '../services/storage';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';

const MEALS = [
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'almuerzo', label: 'Almuerzo' },
  { key: 'merienda', label: 'Merienda' },
  { key: 'cena', label: 'Cena' },
];

const PUNTUACIONES = [
  { value: 5, label: 'Excelente 🟢' },
  { value: 3, label: 'Regular 🟡' },
  { value: 0, label: 'Mala 🔴' },
];

export default function MealsPage() {
  const [meals, setMeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const user = getAuth().currentUser;
  const fecha = dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    if (!user) return;
    getDailyMeals(user.uid, fecha).then(data => {
      setMeals(data || {});
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [user, fecha]);

  const handlePuntuacion = async (key, value) => {
    setError('');
    setSuccess('');
    if (![0, 3, 5].includes(value)) {
      setError('Puntuación inválida.');
      return;
    }
    if (meals.excepcion) {
      setError('No puedes puntuar un día permitido (excepción).');
      return;
    }
    const newMeals = {
      ...meals,
      [key]: { ...meals[key], puntuacion: value },
    };
    const allPuntuadas = MEALS.every(m => newMeals[m.key]?.puntuacion !== undefined);
    const perfectas = allPuntuadas && MEALS.every(m => newMeals[m.key]?.puntuacion === 5);
    newMeals.bonoPerfecto = !!perfectas;
    setMeals(newMeals);
    await saveDailyMeals(user.uid, fecha, newMeals);
    if (perfectas) {
      setSuccess('¡Bonificación por comidas perfectas!');
      setShowBanner(true);
    }
  };

  const handleFoto = async (key, file) => {
    setError('');
    setSuccess('');
    if (!file) return;
    try {
      const url = await uploadMealPhoto(user.uid, fecha, key, file);
      const newMeals = {
        ...meals,
        [key]: { ...meals[key], foto: url },
      };
      setMeals(newMeals);
      await saveDailyMeals(user.uid, fecha, newMeals);
      setSuccess('Foto subida correctamente.');
    } catch (e) {
      setError('Error al subir la foto.');
    }
  };

  const handleExcepcion = async () => {
    setError('');
    setSuccess('');
    if (meals.excepcion) {
      setError('Ya marcaste este día como permitido.');
      return;
    }
    const weekKey = dayjs(fecha).format('YYYY-MM-') + dayjs(fecha).week();
    const used = await hasExceptionThisWeek(user.uid, weekKey);
    if (used) {
      setError('Ya usaste tu excepción esta semana.');
      return;
    }
    const algunaPuntuada = MEALS.some(m => meals[m.key]?.puntuacion !== undefined);
    if (algunaPuntuada) {
      setError('No puedes marcar excepción si ya cargaste puntuaciones.');
      return;
    }
    const newMeals = { ...meals, excepcion: true };
    setMeals(newMeals);
    await saveDailyMeals(user.uid, fecha, newMeals);
    setSuccess('Día permitido marcado. No corta racha.');
  };

  if (loading) return <div className="text-white" role="status" aria-live="polite">Cargando comidas...</div>;

  const hayComidas = MEALS.some(m => meals[m.key]);
  return (
    <>
      {showBanner && <AchievementBanner message="¡Bonificación por comidas perfectas!" onClose={() => setShowBanner(false)} />}
      <div className="max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-6 mt-8" role="form" aria-labelledby="meals-title">
        <h2 id="meals-title" className="text-2xl font-bold text-blue-300 mb-4 text-center">Comidas del día</h2>
        {!hayComidas ? (
          <EmptyState
            title="¡Aún no registraste comidas hoy!"
            description="Carga tus comidas y comienza a sumar puntos."
            illustration="meal"
          />
        ) : (
          <div className="flex flex-col gap-4" role="group" aria-describedby="meals-desc">
            <span id="meals-desc" className="sr-only">Formulario para registrar y puntuar tus comidas del día</span>
            {MEALS.map(m => (
              <div key={m.key} className="flex flex-col md:flex-row md:items-center gap-2 bg-gray-700 rounded-xl px-4 py-3 shadow" role="group" aria-label={m.label}>
                <span className="w-24 font-semibold">{m.label}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFoto(m.key, e.target.files[0])}
                  className="flex-1 text-sm bg-gray-900 text-white rounded px-2 py-1"
                  aria-label={`Subir foto de ${m.label}`}
                  tabIndex={0}
                />
                <select
                  value={meals[m.key]?.puntuacion || ''}
                  onChange={e => handlePuntuacion(m.key, Number(e.target.value))}
                  className="bg-gray-900 text-white rounded px-2 py-1"
                  aria-label={`Puntuar ${m.label}`}
                  tabIndex={0}
                >
                  <option value="">Puntuar</option>
                  {PUNTUACIONES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                {meals[m.key]?.foto && (
                  <img src={meals[m.key].foto} alt={`Foto de ${m.label}`} className="w-10 h-10 object-cover rounded border border-gray-600" />
                )}
              </div>
            ))}
          </div>
        )}
        <button
          className="mt-6 w-full px-4 py-2 bg-blue-600 rounded-xl text-white font-bold text-lg hover:bg-blue-700 disabled:bg-gray-500 transition"
          onClick={handleExcepcion}
          disabled={!!meals.excepcion}
          aria-label={meals.excepcion ? 'Día permitido marcado' : 'Marcar día permitido'}
          tabIndex={0}
        >
          {meals.excepcion ? 'Día permitido marcado' : 'Marcar día permitido'}
        </button>
        <div aria-live="polite" aria-atomic="true">
          {success && <div className="text-green-400 mt-4 text-center font-semibold" role="status">{success}</div>}
          {error && <div className="text-red-400 mt-4 text-center font-semibold" role="alert">{error}</div>}
          {meals.bonoPerfecto && <div className="text-yellow-300 mt-4 text-center font-semibold" role="status">¡Bonificación por comidas perfectas!</div>}
        </div>
      </div>
    </>
  );
}
