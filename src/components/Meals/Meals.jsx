import React, { useState, useEffect } from 'react';
import { finalizeWeeklyMeals } from '../../services/finalizeWeeklyMeals';
import { getAuth } from 'firebase/auth';
import { getDailyMeals, saveDailyMeals } from '../../services/meals';
import { uploadImageToCloudinary } from '../../services/cloudinary';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { deleteField } from 'firebase/firestore';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);


const MEALS = [
  { key: 'desayuno', label: 'Desayuno', icon: '🥣' },
  { key: 'almuerzo', label: 'Almuerzo', icon: '🍽️' },
  { key: 'merienda', label: 'Merienda', icon: '☕' },
  { key: 'cena', label: 'Cena', icon: '🍲' },
];

const PUNTUACIONES = [
  { value: 5, label: 'Muy bien', color: 'bg-emerald-600', icon: '🌞' }, // Muy bien: sol
  { value: 3, label: 'Bien', color: 'bg-green-500', icon: '✅' },      // Bien: check verde
  { value: 1, label: 'Regular', color: 'bg-yellow-400', icon: '😊' },  // Regular: carita sonriente
  { value: -1, label: 'Mal', color: 'bg-orange-500', icon: '⚠️' },     // Mal: advertencia
  { value: -3, label: 'Muy mal', color: 'bg-red-600', icon: '❌' },     // Muy mal: cruz roja
];

export default function Meals({ fecha }) {
    const user = getAuth().currentUser;
    // --- Borrado automático semanal ---
    useEffect(() => {
      if (!user) return;
      const today = dayjs();
      const isMonday = today.day() === 1; // 1 = lunes
      // Guardar en localStorage la última semana borrada
      const lastCleared = localStorage.getItem('lastMealsWeekCleared');
      const thisWeek = today.startOf('isoWeek').format('YYYY-MM-DD');
      if (isMonday && lastCleared !== thisWeek) {
        // Semana anterior: lunes pasado
        const prevWeek = today.subtract(1, 'week').startOf('isoWeek').format('YYYY-MM-DD');
        finalizeWeeklyMeals(user.uid, prevWeek).then(points => {
          localStorage.setItem('lastMealsWeekCleared', thisWeek);
          // Opcional: mostrar mensaje
          // alert(`Comidas de la semana pasada borradas. Puntos guardados: ${points}`);
        });
      }
    }, [user]);
    // Estado para el día seleccionado, inicializado con la prop fecha
    const [selectedDay, setSelectedDay] = useState(fecha);
    // Sincronizar selectedDay con la prop fecha si cambia desde el exterior
    useEffect(() => {
      setSelectedDay(fecha);
    }, [fecha]);
    // Log al montar el componente
    useEffect(() => {
      console.log('[Habitly] Meals.jsx montado. Usuario:', user?.uid, 'Día seleccionado:', selectedDay);
    }, [user, selectedDay]);
    // Estado para modal de edición manual
    const [modalEditar, setModalEditar] = useState({ open: false, mealKey: '', puntuacion: 1 });

    // Función para abrir el modal de edición manual
    const handleAbrirEditar = (mealKey) => {
      setModalEditar({ open: true, mealKey, puntuacion: meals[mealKey]?.puntuacion || 1 });
    };

    // Función para guardar la puntuación manual
    const handleGuardarEdicion = async () => {
        console.log('[Habitly] handleGuardarEdicion llamado', { mealKey: modalEditar.mealKey, puntuacion: modalEditar.puntuacion, selectedDay });
      const { mealKey, puntuacion } = modalEditar;
      const categoria = PUNTUACIONES.find(p => p.value === Number(puntuacion))?.label || 'Regular';
      const newMeals = {
        ...meals,
        [mealKey]: {
          ...meals[mealKey],
          puntuacion: Number(puntuacion),
          categoria,
        },
      };
      setMeals(newMeals);
      await saveDailyMeals(user.uid, selectedDay, newMeals);
      // Recalcular y guardar puntos del mes en localStorage
      await savePuntosMesToLocal(user.uid, selectedDay, newMeals);
      setModalEditar({ open: false, mealKey: '', puntuacion: 1 });
      setSuccess('Calificación actualizada manualmente.');
    };
// Permite override de meals del día actual para feedback inmediato
async function savePuntosMesToLocal(uid, overrideDay, overrideMeals) {
  const mes = dayjs(overrideDay).format('YYYY-MM');
  // Import dinámico para evitar ciclos
  const { getMonthlyMeals, getMonthlyHabits, getMonthlyProgressPoints, getMonthlyLogros } = await import('../../utils/puntosMes');
  // Si hay override, pásalo a getMonthlyMeals
  const comidas = await getMonthlyMeals(uid, mes, overrideDay, overrideMeals);
  const habitos = await getMonthlyHabits(uid, mes);
  const progreso = await getMonthlyProgressPoints(uid, mes);
  const logros = await getMonthlyLogros(uid, mes);
  const puntosMes = comidas + habitos + progreso + logros;
  const data = { mes, puntosMes, desglose: { comidas, habitos, progreso, logros } };
  localStorage.setItem('puntosMes', JSON.stringify(data));
  // Log para debug
  console.log('[Habitly] Puntos recalculados y guardados en localStorage:', data);
}
  const [meals, setMeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [permitidosSemana, setPermitidosSemana] = useState(0);
  const [showWeek, setShowWeek] = useState(false);
  const [weekDays, setWeekDays] = useState([]);
  // Previsualización local de fotos
  const [previewFotos, setPreviewFotos] = useState({});

  // Calcular días de la semana actual
  useEffect(() => {
    const startOfWeek = dayjs(selectedDay).startOf('isoWeek');
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(startOfWeek.add(i, 'day').format('YYYY-MM-DD'));
    }
    setWeekDays(days);
  }, [selectedDay]);

  // Calcular permitidos usados en la semana
  const fetchPermitidosSemana = async () => {
    if (!user) return;
    const startOfWeek = dayjs(selectedDay).startOf('isoWeek');
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

  // Eliminada la función handlePuntuacion (la IA asigna la puntuación)

  const [modalExplicacion, setModalExplicacion] = useState({ open: false, text: '', etiqueta: '', categoria: '' });
  const handleFoto = async (key, file) => {
      console.log('[Habitly] handleFoto llamado', { key, file, selectedDay });
    setError('');
    setSuccess('');
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async e => {
      setPreviewFotos(prev => ({ ...prev, [key]: e.target.result }));
      try {
        const uploadResult = await uploadImageToCloudinary(file);
        if (!uploadResult.secure_url) {
          setError('Error Cloudinary: ' + (uploadResult.error?.message || JSON.stringify(uploadResult)));
          return;
        }
        const url = uploadResult.secure_url;
        const base64 = e.target.result.split(',')[1];
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const aiEndpoint = isLocal
          ? 'http://localhost:4000/api/analyze-food'
          : '/api/analyze-food';
        const aiRes = await fetch(aiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        });
        const aiData = await aiRes.json();
        // Mapear score IA a valor
        let puntuacion = 1;
        if (aiData.score === 'Muy bien') puntuacion = 5;
        else if (aiData.score === 'Bien') puntuacion = 3;
        else if (aiData.score === 'Regular') puntuacion = 1;
        else if (aiData.score === 'Mal') puntuacion = -1;
        else if (aiData.score === 'Muy mal') puntuacion = -3;
        const newMeals = {
          ...meals,
          [key]: {
            ...meals[key],
            foto: url,
            puntuacion,
            etiqueta: aiData.etiqueta,
            explicacion: aiData.result?.candidates?.[0]?.content?.parts?.[0]?.text || '',
            categoria: aiData.score
          },
        };
        setMeals(newMeals);
        setPreviewFotos(prev => ({ ...prev, [key]: undefined }));
        await saveDailyMeals(user.uid, selectedDay, newMeals);
        // Recalcular y guardar puntos del mes en localStorage
        await savePuntosMesToLocal(user.uid, selectedDay, meals);
        setSuccess('Foto y puntuación IA guardadas.');
      } catch (e) {
        setError('Error IA: ' + (e.message || e.toString()));
        console.error('Error IA:', e);
      }
    };
    reader.readAsDataURL(file);
  };

  // Nuevo: permitido por comida, máximo 2 por semana
  const handlePermitido = async (mealKey) => {
      console.log('[Habitly] handlePermitido llamado', { mealKey, selectedDay, meals });
    setError('');
    setSuccess('');
    // Si ya está marcado como permitido, desmarcarlo y restaurar puntuación previa si existe
    if (meals[mealKey]?.permitido) {
      const prevPuntuacion = meals[mealKey]?.prevPuntuacion;
      const newMeals = { ...meals, [mealKey]: { ...meals[mealKey] } };
      delete newMeals[mealKey].permitido;
      if (prevPuntuacion !== undefined) {
        newMeals[mealKey].puntuacion = prevPuntuacion;
        delete newMeals[mealKey].prevPuntuacion;
      } else {
        delete newMeals[mealKey].puntuacion;
        delete newMeals[mealKey].prevPuntuacion;
      }
      // Eliminar prevPuntuacion si es undefined
      if (newMeals[mealKey].prevPuntuacion === undefined) {
        delete newMeals[mealKey].prevPuntuacion;
      }
      setMeals(newMeals);
      // Eliminar el campo permitido y prevPuntuacion en Firestore para el día seleccionado
      const ref = doc(db, 'meals', `${user.uid}_${selectedDay}`);
      await updateDoc(ref, { [`${mealKey}.permitido`]: deleteField(), [`${mealKey}.prevPuntuacion`]: deleteField() });
      await saveDailyMeals(user.uid, selectedDay, newMeals);
      await savePuntosMesToLocal(user.uid, selectedDay, newMeals);
      setTimeout(() => {
        fetchPermitidosSemana();
      }, 250);
      setSuccess('Permitido desmarcado.');
      return;
    }
    // Contar permitidos en la semana
    const startOfWeek = dayjs(selectedDay).startOf('isoWeek');
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
    // Marcar permitido en la comida: puntuación 0, guardar puntuación previa
    const prevPuntuacion = meals[mealKey]?.puntuacion;
    const newMeals = {
      ...meals,
      [mealKey]: {
        ...meals[mealKey],
        permitido: true,
        puntuacion: 0
      }
    };
    if (prevPuntuacion !== undefined) {
      newMeals[mealKey].prevPuntuacion = prevPuntuacion;
    }
    // Eliminar prevPuntuacion si es undefined
    if (newMeals[mealKey].prevPuntuacion === undefined) {
      delete newMeals[mealKey].prevPuntuacion;
    }
    setMeals(newMeals);
    await saveDailyMeals(user.uid, selectedDay, newMeals);
    await savePuntosMesToLocal(user.uid, selectedDay, newMeals);
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
            {weekDays.map((d, idx) => {
              const jsDay = dayjs(d).day();
              const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
              const dayName = dayNames[jsDay];
              return (
                <button
                  key={d}
                  className={`px-0.5 py-0.5 rounded-full text-[0.65rem] font-bold shadow transition-all duration-200 focus:outline-none mx-[2px] ${selectedDay === d ? 'bg-blue-500 text-white' : 'bg-gray-700 text-blue-200 hover:bg-blue-400 hover:text-white'}`}
                  onClick={() => setSelectedDay(d)}
                  title={d}
                >
                  {dayName}<br />{dayjs(d).format('DD/MM')}
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
            {/* Categoría IA asignada automáticamente */}
            {meals[meal.key]?.puntuacion !== undefined && !meals[meal.key]?.permitido && (
              <div className="absolute left-1/2 bottom-11 z-20 flex flex-col items-center -translate-x-1/2">
                <span
                  className={`px-4 py-1.5 text-base rounded-full font-bold text-white shadow scale-105 mb-1 ${PUNTUACIONES.find(o => o.value === meals[meal.key]?.puntuacion)?.color}`}
                >
                  {PUNTUACIONES.find(o => o.value === meals[meal.key]?.puntuacion)?.icon} {meals[meal.key]?.categoria || PUNTUACIONES.find(o => o.value === meals[meal.key]?.puntuacion)?.label}
                </span>
                <button
                  className="mt-1 px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold shadow hover:bg-blue-700 transition"
                  onClick={() => setModalExplicacion({ open: true, text: meals[meal.key]?.explicacion || '', etiqueta: meals[meal.key]?.etiqueta, categoria: meals[meal.key]?.categoria })}
                >
                  ¿Por qué esta puntuación?
                </button>
                {/* Botón para editar calificación manualmente en la esquina inferior derecha */}
                <div style={{ position: 'absolute', right: '-72px', bottom: '-38px', zIndex: 30 }}>
                  <button
                    className="px-3 py-1 rounded bg-gray-500/70 text-white text-xs font-semibold shadow hover:bg-gray-600/70 transition"
                    onClick={() => handleAbrirEditar(meal.key)}
                    title="Editar calificación manualmente"
                  >
                    <span role="img" aria-label="Editar">✏️</span>
                  </button>
                </div>
              </div>
            )}
                  {/* Modal para editar calificación manualmente */}
                  {modalEditar.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                      <div className="bg-white rounded-xl shadow-lg p-6 max-w-xs w-full relative">
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 font-bold text-lg" onClick={() => setModalEditar({ open: false, mealKey: '', puntuacion: 1 })}>×</button>
                        <h4 className="text-lg font-bold mb-4 text-yellow-700">Editar calificación</h4>
                        <div className="mb-4">
                          <label className="block text-gray-700 font-semibold mb-2">Selecciona la categoría:</label>
                          <div className="flex flex-col gap-2">
                            {PUNTUACIONES.map(p => (
                              <label key={p.value} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${modalEditar.puntuacion === p.value ? p.color + ' text-white font-bold' : 'bg-gray-100 text-gray-800'}`}>
                                <input
                                  type="radio"
                                  name="puntuacion"
                                  value={p.value}
                                  checked={modalEditar.puntuacion === p.value}
                                  onChange={() => setModalEditar(m => ({ ...m, puntuacion: p.value }))}
                                  className="form-radio h-4 w-4 text-blue-600"
                                />
                                <span>{p.icon} {p.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <button
                          className="w-full py-2 rounded bg-yellow-500 text-white font-bold shadow hover:bg-yellow-600 transition"
                          onClick={handleGuardarEdicion}
                        >
                          Guardar calificación
                        </button>
                      </div>
                    </div>
                  )}
            {/* Estado/Puntaje debajo de la calificación */}
            {/* Estado/Puntaje debajo de la calificación (opcional, solo puntos) */}
            {meals[meal.key]?.puntuacion !== undefined && !meals[meal.key]?.permitido && (
              <span className="absolute left-1/2 bottom-2 z-30 -translate-x-1/2 text-xs font-semibold text-blue-300 bg-black/60 px-3 py-1 rounded-full shadow">
                {(() => {
                  const puntos = meals[meal.key]?.puntuacion;
                  if (typeof puntos === 'number') {
                    return `${puntos > 0 ? '+' : ''}${puntos} pts`;
                  }
                  return '';
                })()}
              </span>
            )}
                  {/* Modal de explicación IA */}
                  {modalExplicacion.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                      <div className="bg-white rounded-xl shadow-lg p-6 max-w-xs w-full relative">
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 font-bold text-lg" onClick={() => setModalExplicacion({ open: false, text: '', etiqueta: '', categoria: '' })}>×</button>
                        <h4 className="text-lg font-bold mb-2 text-blue-700">Explicación IA</h4>
                        {(() => {
                          // Buscar color según categoría
                          const cat = modalExplicacion.categoria;
                          const color = PUNTUACIONES.find(o => o.label === cat)?.color || 'bg-gray-400';
                          const textColor = color.replace('bg-', 'text-');
                          return (
                            <>
                              {modalExplicacion.etiqueta && (
                                <div className="mb-1 text-sm text-gray-700">
                                  <b>Comida detectada:</b> <span className={textColor}>{modalExplicacion.etiqueta}</span>
                                </div>
                              )}
                              {modalExplicacion.categoria && (
                                <div className="mb-1 text-sm text-gray-700">
                                  <b>Categoría:</b> <span className={textColor}>{modalExplicacion.categoria}</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                        {(() => {
                          // Parsear el texto IA en líneas
                          const lines = (modalExplicacion.text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                          // Evitar repetir comida/categoría
                          let explicacion = '';
                          let tips = '';
                          lines.forEach((line, idx) => {
                            if (line.toLowerCase().startsWith('explicación:')) explicacion = line.replace(/^explicación:/i, '').trim();
                            if (line.toLowerCase().startsWith('tips para mejorar:')) tips = line.replace(/^tips para mejorar:/i, '').trim();
                          });
                          // Si la IA no separó bien, intentar heurística
                          if (!explicacion && lines[2]) explicacion = lines[2];
                          if (!tips && lines[3]) tips = lines[3];
                          return (
                            <div className="text-gray-800 text-sm mt-2">
                              <div className="mb-2"><b>Explicación:</b> {explicacion || 'No disponible.'}</div>
                              <div><b>Tips para mejorar:</b> {tips || 'No disponible.'}</div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
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
                  disabled={loading || dayjs(selectedDay).isAfter(dayjs(), 'day')}
                />
                {dayjs(selectedDay).isAfter(dayjs(), 'day') && (
                  <div className="text-xs text-yellow-400 font-semibold mt-1 text-center">
                    {(() => {
                      const dias = {
                        monday: 'lunes',
                        tuesday: 'martes',
                        wednesday: 'miércoles',
                        thursday: 'jueves',
                        friday: 'viernes',
                        saturday: 'sábado',
                        sunday: 'domingo',
                      };
                      // dayjs().format('dddd') da el nombre en inglés, lo pasamos a minúsculas para el mapeo
                      const diaEn = dayjs(selectedDay).format('dddd').toLowerCase();
                      // Mapear a español
                      const diaEs = dias[diaEn] || dayjs(selectedDay).format('dddd');
                      return `No está habilitado hasta que sea ${diaEs}`;
                    })()}
                  </div>
                )}
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

