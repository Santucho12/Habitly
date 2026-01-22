
import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDailyMeals, saveDailyMeals } from '../../services/meals';
import dayjs from 'dayjs';


const MEALS = [
  { key: 'desayuno', label: 'Desayuno', icon: '🥣' },
  { key: 'almuerzo', label: 'Almuerzo', icon: '🍽️' },
  { key: 'merienda', label: 'Merienda', icon: '☕' },
  { key: 'cena', label: 'Cena', icon: '🍲' },
];

const PUNTUACIONES = [
  { value: 5, label: 'Bien', color: 'bg-green-500', icon: '✅' },
  { value: 3, label: 'Safa', color: 'bg-yellow-400', icon: '😐' },
  { value: 0, label: 'Mal', color: 'bg-red-500', icon: '❌' },
];

export default function Meals({ fecha }) {
  const [meals, setMeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [permitidosSemana, setPermitidosSemana] = useState(0);
  const user = getAuth().currentUser;
  const [showWeek, setShowWeek] = useState(false);
  const [selectedDay, setSelectedDay] = useState(fecha || dayjs().format('YYYY-MM-DD'));
  const [weekDays, setWeekDays] = useState([]);

  // Calcular días de la semana actual
  useEffect(() => {
    const startOfWeek = dayjs(selectedDay).startOf('week');
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(startOfWeek.add(i, 'day').format('YYYY-MM-DD'));
    }
    setWeekDays(days);
  }, [selectedDay]);

  // Calcular permitidos usados en la semana
  useEffect(() => {
    async function fetchPermitidosSemana() {
      if (!user) return;
      const startOfWeek = dayjs(selectedDay).startOf('week');
      let totalPermitidos = 0;
      for (let i = 0; i < 7; i++) {
        const d = startOfWeek.add(i, 'day').format('YYYY-MM-DD');
        const data = await getDailyMeals(user.uid, d);
        if (data) {
          MEALS.forEach(m => {
            if (data[m.key]?.permitido) totalPermitidos++;
          });
        }
      }
      setPermitidosSemana(totalPermitidos);
    }
    fetchPermitidosSemana();
  }, [user, selectedDay]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getDailyMeals(user.uid, selectedDay).then(data => {
      setMeals(data || {});
      setLoading(false);
    });
  }, [user, selectedDay]);

  useEffect(() => {
    if (!user) return;
      setLoading(true);
      getDailyMeals(user.uid, selectedDay).then(data => {
      setMeals(data || {});
      setLoading(false);
    });
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

  // Nuevo: permitido por comida, máximo 2 por semana
  const handlePermitido = async (mealKey) => {
    setError('');
    setSuccess('');
    // Si ya está marcado como permitido, no hacer nada
    if (meals[mealKey]?.permitido) {
      setError('Ya marcaste esta comida como permitido.');
      return;
    }
    // Contar permitidos en la semana
    const startOfWeek = dayjs(fecha).startOf('week');
    let permitidosSemana = 0;
    for (let i = 0; i < 7; i++) {
      const d = startOfWeek.add(i, 'day').format('YYYY-MM-DD');
      const data = await getDailyMeals(user.uid, d);
      if (data) {
        MEALS.forEach(m => {
          if (data[m.key]?.permitido) permitidosSemana++;
        });
      }
    }
    if (permitidosSemana >= 2) {
      setError('Ya usaste tus 2 permitidos esta semana.');
      return;
    }
    // Si ya puntuaste, no se puede marcar permitido
    if (meals[mealKey]?.puntuacion !== undefined) {
      setError('No puedes marcar permitido si ya cargaste puntuación.');
      return;
    }
    // Marcar permitido en la comida
    const newMeals = {
      ...meals,
      [mealKey]: { ...meals[mealKey], permitido: true, puntuacion: undefined },
    };
    setMeals(newMeals);
    await saveDailyMeals(user.uid, fecha, newMeals);
    setSuccess('Permitido marcado. No resta puntos ni afecta racha.');
  };

  if (loading) return <div>Cargando comidas...</div>;

  return (
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 rounded-2xl p-5 mb-8 shadow-xl max-w-md mx-auto">
      <h3 className="text-2xl font-extrabold mb-2 text-blue-300 text-center drop-shadow">Comidas del día</h3>
      {selectedDay !== dayjs().format('YYYY-MM-DD') && (
        <div className="text-center text-blue-200 font-bold mb-4 text-lg">
          Día seleccionado: {dayjs(selectedDay).format('dddd DD/MM/YYYY')}<br />
          Día número: {dayjs(selectedDay).day() + 1}
        </div>
      )}
        <div className="flex justify-center mb-4">
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition"
            onClick={() => setShowWeek(v => !v)}
          >
            {showWeek ? 'Ocultar semana' : 'Ver semana completa'}
          </button>
        </div>
        {showWeek && (
          <div className="flex flex-row justify-center gap-2 mb-6">
            {weekDays.map((day, idx) => {
              const dayName = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'][dayjs(day).day()];
              return (
                <button
                  key={day}
                  className={`px-2 py-1 rounded-full text-xs font-bold shadow transition-all duration-200 focus:outline-none ${selectedDay === day ? 'bg-blue-500 text-white' : 'bg-gray-700 text-blue-200 hover:bg-blue-400 hover:text-white'}`}
                  onClick={() => setSelectedDay(day)}
                  title={day}
                >
                  {dayName}<br />{dayjs(day).format('DD/MM')}
                </button>
              );
            })}
          </div>
        )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {MEALS.map(meal => (
          <div key={meal.key} className="relative flex flex-col items-center bg-gray-900 rounded-xl p-4 shadow-lg border-2 border-blue-700">
            {/* ...existing code for each meal card... */}
            <button
              className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded-full font-bold text-white shadow transition-all duration-200 focus:outline-none bg-gray-500 flex items-center gap-1 ${meals[meal.key]?.permitido ? 'ring-2 ring-white scale-105' : 'opacity-80 hover:scale-105'}`}
              onClick={() => handlePermitido(meal.key)}
              disabled={loading || meals[meal.key]?.puntuacion !== undefined || meals[meal.key]?.permitido}
              title="Marcar permitido"
            >
              <span role="img" aria-label="Permitido">🍽️</span>
              <span>Permitido</span>
            </button>
            <span className="text-4xl mb-2">{meal.icon}</span>
            <span className="font-bold text-white text-lg mb-2 drop-shadow">{meal.label}</span>
            <div className="flex gap-3 mb-2">
              {PUNTUACIONES.map(opt => (
                <button
                  key={opt.value}
                  className={`px-2 py-0.5 text-sm rounded-full font-bold text-white shadow transition-all duration-200 focus:outline-none ${opt.color} ${meals[meal.key]?.puntuacion === opt.value ? 'ring-2 ring-white scale-105' : 'opacity-80 hover:scale-105'}`}
                  onClick={() => handlePuntuacion(meal.key, opt.value)}
                  disabled={loading || meals[meal.key]?.permitido}
                  title={opt.label}
                >
                  <span className="text-base mr-1">{opt.icon}</span>{opt.label}
                </button>
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={e => handleFoto(meal.key, e.target.files[0])}
              className="mt-2 mb-2 text-xs text-gray-300"
              disabled={loading}
            />
            {meals[meal.key]?.foto && (
              <img src={meals[meal.key].foto} alt="foto comida" className="w-32 h-32 object-cover rounded shadow-lg border-2 border-blue-400 mt-2" />
            )}
            {meals[meal.key]?.permitido && (
              <span className="text-sm font-semibold text-gray-300 mt-1">Permitido: no suma ni resta puntos</span>
            )}
            {meals[meal.key]?.puntuacion !== undefined && !meals[meal.key]?.permitido && (
              <span className="text-sm font-semibold text-blue-300 mt-1">
                Estado: {PUNTUACIONES.find(o => o.value === meals[meal.key]?.puntuacion)?.label}
                {(() => {
                  const puntos = meals[meal.key]?.puntuacion;
                  return typeof puntos === 'number' ? `  (+${puntos} pts)` : '';
                })()}
              </span>
            )}
          </div>
        ))}
      </div>
      {/* Resumen de puntos y permitidos */}
      <div className="mt-4 flex flex-col items-center gap-2">
        {/* Calcular puntos totales del día */}
        {(() => {
          const maxPuntosDia = 20; // 4 comidas x 5 puntos
          let puntosDia = 0;
          MEALS.forEach(meal => {
            if (meals[meal.key]?.puntuacion !== undefined && !meals[meal.key]?.permitido) {
              puntosDia += meals[meal.key]?.puntuacion;
            }
          });
          return (
            <>
              <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-200 font-semibold">Puntos del día seleccionado:</span>
                <span className="text-blue-400 text-lg font-bold">{puntosDia}/{maxPuntosDia}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-200 font-semibold">Permitidos usados esta semana:</span>
                <span className="text-green-400 text-lg font-bold">{permitidosSemana}/2</span>
              </div>
            </>
          );
        })()}
      </div>
      {/* Mensajes y bonificación */}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 text-sm rounded-lg px-3 py-2 mt-4 text-center font-semibold shadow">{success}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg px-3 py-2 mt-4 text-center font-semibold shadow">{error}</div>}
      {meals.bonoPerfecto && <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 text-sm rounded-lg px-3 py-2 mt-4 text-center font-semibold shadow">¡Bonificación por comidas perfectas!</div>}
      <div className="text-center text-gray-300 mt-4 text-sm">Registra cada comida, súbele foto y puntúa tu día para sumar puntos y mejorar tu salud.</div>
    </div>
  );
}
