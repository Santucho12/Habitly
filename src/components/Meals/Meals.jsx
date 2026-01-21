
import React, { useState, useEffect } from 'react';
import { saveDailyMeals, getDailyMeals } from '../../services/meals';
import { hasExceptionThisWeek } from '../../services/mealsException';
import { uploadMealPhoto } from '../../services/storage';
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

export default function Meals({ fecha }) {
  const [meals, setMeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;
    getDailyMeals(user.uid, fecha).then(data => {
      setMeals(data || {});
      setLoading(false);
    });
  }, [user, fecha]);

  const handlePuntuacion = async (key, value) => {
    setError('');
    setSuccess('');
    // Solo se permiten puntuaciones 0, 3, 5
    if (![0, 3, 5].includes(value)) {
      setError('Puntuación inválida.');
      return;
    }
    // No se puede puntuar días con excepción
    if (meals.excepcion) {
      setError('No puedes puntuar un día permitido (excepción).');
      return;
    }
    const newMeals = {
      ...meals,
      [key]: { ...meals[key], puntuacion: value },
    };
    // Bonificación comidas perfectas
    const allPuntuadas = MEALS.every(m => newMeals[m.key]?.puntuacion !== undefined);
    const perfectas = allPuntuadas && MEALS.every(m => newMeals[m.key]?.puntuacion === 5);
    newMeals.bonoPerfecto = !!perfectas;
    setMeals(newMeals);
    await saveDailyMeals(user.uid, fecha, newMeals);
    if (perfectas) setSuccess('¡Bonificación por comidas perfectas!');
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

  // Excepción (día permitido)
  const handleExcepcion = async () => {
    setError('');
    setSuccess('');
    if (meals.excepcion) {
      setError('Ya marcaste este día como permitido.');
      return;
    }
    // Validar que no haya otra excepción esta semana
    const weekKey = dayjs(fecha).format('YYYY-MM-') + dayjs(fecha).week();
    const used = await hasExceptionThisWeek(user.uid, weekKey);
    if (used) {
      setError('Ya usaste tu excepción esta semana.');
      return;
    }
    // Validar que no existan puntuaciones ya cargadas en el día
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

  if (loading) return <div>Cargando comidas...</div>;

  return (
    <div className="bg-gray-800 p-4 rounded mb-4">
      <h3 className="text-lg font-bold mb-2">Comidas del día</h3>
      {MEALS.map(m => (
        <div key={m.key} className="flex items-center mb-2">
          <span className="w-24">{m.label}</span>
          <input type="file" accept="image/*" onChange={e => handleFoto(m.key, e.target.files[0])} className="mr-2" />
          <select
            value={meals[m.key]?.puntuacion || ''}
            onChange={e => handlePuntuacion(m.key, Number(e.target.value))}
            className="bg-gray-700 text-white rounded px-2 py-1"
          >
            <option value="">Puntuar</option>
            {PUNTUACIONES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {meals[m.key]?.foto && (
            <img src={meals[m.key].foto} alt="foto comida" className="w-10 h-10 object-cover ml-2 rounded" />
          )}
        </div>
      ))}
      <button
        className="mt-4 px-4 py-2 bg-blue-600 rounded text-white disabled:bg-gray-500"
        onClick={handleExcepcion}
        disabled={!!meals.excepcion}
      >
        {meals.excepcion ? 'Día permitido marcado' : 'Marcar día permitido'}
      </button>
      {success && <div className="text-green-400 mt-2">{success}</div>}
      {error && <div className="text-red-400 mt-2">{error}</div>}
      {meals.bonoPerfecto && <div className="text-yellow-300 mt-2">¡Bonificación por comidas perfectas!</div>}
    </div>
  );
}
