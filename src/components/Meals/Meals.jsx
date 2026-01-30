
import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDailyMeals, saveDailyMeals } from '../../services/meals';
import { uploadImageToCloudinary } from '../../services/cloudinary';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { deleteField } from 'firebase/firestore';
import dayjs from 'dayjs';


const MEALS = [
  { key: 'desayuno', label: 'Desayuno', icon: '🥣' },
  { key: 'almuerzo', label: 'Almuerzo', icon: '🍽️' },
  { key: 'merienda', label: 'Merienda', icon: '☕' },
  { key: 'cena', label: 'Cena', icon: '🍲' },
];

const PUNTUACIONES = [
  { value: 5, label: 'Bien', color: 'bg-green-500', icon: '✅' },
  { value: 2, label: 'Safa', color: 'bg-yellow-400', icon: '😐' },
  { value: -2, label: 'Mal', color: 'bg-red-500', icon: '❌' },
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
  // Previsualización local de fotos
  const [previewFotos, setPreviewFotos] = useState({});

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
  const fetchPermitidosSemana = async () => {
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
  };
  useEffect(() => {
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

  // (Eliminada la declaración duplicada de handlePermitido)

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
    if (![5, 2, -2].includes(value)) {
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
    // Previsualización instantánea
    const reader = new FileReader();
    reader.onload = e => {
      setPreviewFotos(prev => ({ ...prev, [key]: e.target.result }));
    };
    reader.readAsDataURL(file);
    try {
      const uploadResult = await uploadImageToCloudinary(file);
      console.log('Cloudinary meal upload result:', uploadResult);
      if (!uploadResult.secure_url) {
        setError('Error Cloudinary: ' + (uploadResult.error?.message || JSON.stringify(uploadResult)));
        return;
      }
      const url = uploadResult.secure_url;
      const newMeals = {
        ...meals,
        [key]: { ...meals[key], foto: url },
      };
      setMeals(newMeals);
      setPreviewFotos(prev => ({ ...prev, [key]: undefined })); // Limpiar preview al guardar
      await saveDailyMeals(user.uid, fecha, newMeals);
      setSuccess('Foto subida correctamente.');
    } catch (e) {
      setError('Error al subir la foto: ' + (e.message || e.toString()));
      console.error('Error al subir la foto:', e);
    }
  };

  // Nuevo: permitido por comida, máximo 2 por semana
  const handlePermitido = async (mealKey) => {
    setError('');
    setSuccess('');
    // Si ya está marcado como permitido, desmarcarlo
    if (meals[mealKey]?.permitido) {
      const newMeals = { ...meals, [mealKey]: { ...meals[mealKey] } };
      delete newMeals[mealKey].permitido;
      setMeals(newMeals);
      // Eliminar el campo permitido en Firestore para el día seleccionado
      const ref = doc(db, 'meals', `${user.uid}_${selectedDay}`);
      await updateDoc(ref, { [`${mealKey}.permitido`]: deleteField() });
      setTimeout(() => {
        fetchPermitidosSemana();
      }, 250);
      setSuccess('Permitido desmarcado.');
      return;
    }
    // Contar permitidos en la semana
    const startOfWeek = dayjs(selectedDay).startOf('week');
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
    if (permitidosSemana >= 4) {
      setError('Ya usaste tus 4 permitidos esta semana.');
      return;
    }
    // Marcar permitido en la comida (borra puntuación si la hay)
    const newMeals = {
      ...meals,
      [mealKey]: { ...meals[mealKey], permitido: true }
    };
    if (newMeals[mealKey].puntuacion === undefined) {
      delete newMeals[mealKey].puntuacion;
    }
    setMeals(newMeals);
    await saveDailyMeals(user.uid, selectedDay, newMeals);
    setTimeout(() => {
      fetchPermitidosSemana();
    }, 250);
    setSuccess('Permitido marcado. No suma ni resta puntos y se suma al contador.');
  };

  if (loading) return <div>Cargando comidas...</div>;

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-2xl p-5 mb-8 shadow-xl max-w-md mx-auto">
      <h3 className="text-2xl font-extrabold mb-4 text-blue-300 text-center drop-shadow">Comidas del día</h3>
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
          <div className="flex flex-wrap justify-center gap-2 mb-6 px-1">
            {weekDays.map((day, idx) => {
              const dayName = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'][dayjs(day).day()];
              return (
                <button
                  key={day}
                  className={`px-0.5 py-0.5 rounded-full text-[0.65rem] font-bold shadow transition-all duration-200 focus:outline-none mx-[2px] ${selectedDay === day ? 'bg-blue-500 text-white' : 'bg-gray-700 text-blue-200 hover:bg-blue-400 hover:text-white'}`}
                  onClick={() => setSelectedDay(day)}
                  title={day}
                >
                  {dayName}<br />{dayjs(day).format('DD/MM')}
                </button>
              );
            })}
          </div>
        )}
      <div className="flex flex-col gap-6 mb-6">
        {MEALS.map(meal => (
          <div key={meal.key} className="relative flex flex-col items-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 rounded-xl px-4 py-5 shadow-lg border border-gray-700 min-h-[22rem]">
            {/* Botón permitido arriba a la derecha */}
            <div className="absolute right-3 top-3 z-20">
              <button
                className={`px-1 py-0.5 rounded-full text-[0.7rem] font-bold shadow transition-all duration-200 focus:outline-none flex items-center gap-1
                  ${meals[meal.key]?.permitido ? 'bg-green-500 text-white animate-pulse ring-2 ring-green-300 scale-110' : 'bg-blue-600 text-white hover:scale-105'}`}
                onClick={() => handlePermitido(meal.key)}
                disabled={loading}
                title={meals[meal.key]?.permitido ? "Desmarcar permitido" : "Marcar permitido"}
              >
                <span role="img" aria-label="Permitido">🍽️</span>
                <span>Permitido</span>
              </button>
            </div>
            {/* Calificación centrada abajo, sin opacidad, más arriba, más separados y más anchos */}
            <div className="absolute left-1/2 bottom-11 z-20 flex gap-0 -translate-x-1/2">
              {PUNTUACIONES.map(opt => (
                <button
                  key={opt.value}
                  className={`w-32 px-0 py-1.5 text-sm rounded-full font-bold text-white shadow transition-all duration-200 focus:outline-none ${opt.color} scale-[0.7] ${meals[meal.key]?.puntuacion === opt.value ? 'ring-2 ring-white scale-105' : 'hover:scale-105'}`}
                  onClick={() => handlePuntuacion(meal.key, opt.value)}
                  disabled={loading || meals[meal.key]?.permitido}
                  title={opt.label}
                  style={{ marginRight: opt.value !== PUNTUACIONES[PUNTUACIONES.length - 1].value ? '-23px' : '0' }}
                >
                  <span className="text-base mr-1">{opt.icon}</span>{opt.label}
                </button>
              ))}
            </div>
            {/* Estado/Puntaje debajo de la calificación */}
            {meals[meal.key]?.puntuacion !== undefined && !meals[meal.key]?.permitido && (
              <span className="absolute left-1/2 bottom-2 z-30 -translate-x-1/2 text-xs font-semibold text-blue-300 bg-black/60 px-3 py-1 rounded-full shadow">
                Estado: {PUNTUACIONES.find(o => o.value === meals[meal.key]?.puntuacion)?.label}
                {(() => {
                  const puntos = meals[meal.key]?.puntuacion;
                  return typeof puntos === 'number' ? `  (+${puntos} pts)` : '';
                })()}
              </span>
            )}
            {/* Imagen de la comida ocupa el 90% de la card */}
            {(previewFotos[meal.key] || meals[meal.key]?.foto) && (
              <img
                src={previewFotos[meal.key] || meals[meal.key]?.foto}
                alt="foto comida"
                className="w-full h-full object-cover rounded-xl shadow-lg border-2 border-blue-400 absolute left-0 top-0 z-10"
              />
            )}
            {/* Contenido debajo de la imagen */}
            <div className="relative z-0 flex flex-col items-center w-full mt-40">
              <div style={{ marginTop: '-130px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {!meals[meal.key]?.foto && (
                  <>
                    <span className="text-5xl mb-2 drop-shadow-lg">{meal.icon}</span>
                    <span className="font-extrabold text-blue-300 text-lg mb-2 drop-shadow text-center">{meal.label}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFoto(meal.key, e.target.files[0])}
                  className="mt-2 mb-2 text-xs text-gray-300"
                  disabled={loading}
                />
              </div>
              {meals[meal.key]?.permitido && (
                <span className="text-xs font-semibold text-gray-300 mt-1">Permitido: no suma ni resta puntos</span>
              )}
            </div>
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
            // Si está marcado como permitido, no suma ni resta puntos
            if (meals[meal.key]?.permitido) {
              // No sumar ni restar puntos
              return;
            }
            if (meals[meal.key]?.puntuacion !== undefined) {
              puntosDia += meals[meal.key]?.puntuacion;
            }
          });
          // Permitir que el puntaje sea negativo
          return (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-200 font-semibold">Puntos del día seleccionado:</span>
                <span className={`text-lg font-bold ${puntosDia < 0 ? 'text-red-400' : 'text-blue-400'}`}>{puntosDia}/{maxPuntosDia}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-200 font-semibold">Permitidos usados esta semana:</span>
                <span className="text-green-400 text-lg font-bold">{permitidosSemana}/4</span>
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
