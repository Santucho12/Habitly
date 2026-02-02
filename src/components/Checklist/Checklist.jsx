import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getHabitsByUser } from '../../services/habitService';
import { saveDailyActivity, getDailyActivity } from '../../services/habits';
import { calcularPuntosDia } from '../../utils/points';
import { actualizarRacha } from '../../utils/streaks';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
// import { savePuntosMesToLocalAndFirestore } from '../../utils/savePuntosMesToLocalAndFirestore';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(weekOfYear);

const ACTIVITIES = [
  { key: 'gym', label: 'Gimnasio', points: 10 },
  { key: 'correr', label: 'Correr', points: 15 },
  { key: 'caminar', label: 'Caminar', points: 8 },
];

export default function Checklist({ showAddHabitForm = true, fecha }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = fecha || dayjs().format('YYYY-MM-DD');
  const weekNumber = dayjs(today).week();
  const [weekActivities, setWeekActivities] = useState([]); // [{date, gym, correr, caminar}]
  const [monthActivities, setMonthActivities] = useState([]); // [{date, gym, correr, caminar}]
  const [showMonth, setShowMonth] = useState(false);
  // Estados para el formulario de nuevo hábito
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitType, setNewHabitType] = useState('gym');
  const [newHabitMeta, setNewHabitMeta] = useState(1);
  const [addHabitError, setAddHabitError] = useState('');
  const [addHabitSuccess, setAddHabitSuccess] = useState('');

  useEffect(() => {
    async function fetchWeekAndMonth() {
      if (!user) return;
      const habitsData = await getHabitsByUser(user.uid);
      setHabits(habitsData);
      const todayData = await getDailyActivity(user.uid, today);
      setChecked(todayData || {});
      // Semana: lunes a domingo de la semana actual
      // Buscar el lunes de la semana actual (si hoy es domingo, retroceder 6 días)
      const todayDate = dayjs(today);
      const dayOfWeek = todayDate.day(); // 0=domingo, 1=lunes, ...
      const monday = dayOfWeek === 0 ? todayDate.subtract(6, 'day') : todayDate.startOf('week').add(1, 'day');
      let weekArr = [];
      for (let i = 0; i < 7; i++) {
        const d = monday.add(i, 'day').format('YYYY-MM-DD');
        // eslint-disable-next-line no-await-in-loop
        const act = await getDailyActivity(user.uid, d);
        weekArr.push({
          date: d,
          gym: act?.gym || false,
          correr: act?.correr || false,
          caminar: act?.caminar || false,
        });
      }
      setWeekActivities(weekArr);
      // Mes
      const monthStart = dayjs().startOf('month');
      const daysInMonth = dayjs().daysInMonth();
      let monthArr = [];
      for (let i = 0; i < daysInMonth; i++) {
        const d = monthStart.add(i, 'day').format('YYYY-MM-DD');
        // eslint-disable-next-line no-await-in-loop
        const act = await getDailyActivity(user.uid, d);
        monthArr.push({
          date: d,
          gym: act?.gym || false,
          correr: act?.correr || false,
          caminar: act?.caminar || false,
        });
      }
      setMonthActivities(monthArr);
      setLoading(false);
    }
    fetchWeekAndMonth();
  }, [user, today]);

  const handleCheck = async (key) => {
    if (checked[key]) return; // No desmarcar
    // Solo se puede marcar el día actual
    if (dayjs().format('YYYY-MM-DD') !== today) {
      setError('Solo puedes marcar actividades del día actual.');
      return;
    }
    // Validar meta semanal (no más de lo permitido)
    const habit = habits.find(h => h.type === key || h.name?.toLowerCase() === key);
    if (!habit) {
      setError('No tienes meta para esta actividad.');
      return;
    }
    // Buscar cuántas veces ya marcó esta actividad en la semana
    const weekStart = dayjs().startOf('week');
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = weekStart.add(i, 'day').format('YYYY-MM-DD');
      // eslint-disable-next-line no-await-in-loop
      const act = await getDailyActivity(user.uid, d);
      if (act && act[key]) count++;
    }
    if (count >= (habit.meta || habit.goal || 1)) {
      setError('Ya alcanzaste la meta semanal para esta actividad.');
      return;
    }

    // Guardar actividad diaria
    const newChecked = { ...checked, [key]: true };
    setChecked(newChecked);
    setError('');
    await saveDailyActivity(user.uid, today, newChecked);
    // Recalcular y guardar puntos del mes en localStorage
    const mes = dayjs().format('YYYY-MM');
    // Ya no es necesario llamar aquí, el listener global lo recalcula automáticamente
  // Función para recalcular y guardar puntos del mes en localStorage


    // --- Lógica de puntos y rachas ---
    // Obtener datos previos del usuario
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    let userData = userSnap.exists() ? userSnap.data() : {};

    // Calcular puntos del día (solo actividades físicas)
    const puntosDia = calcularPuntosDia({
      gym: newChecked.gym,
      correr: newChecked.correr,
      caminar: newChecked.caminar,
    });

    // Actualizar rachas (ejemplo solo gimnasio, se puede expandir)
    const nuevaRachaGimnasio = actualizarRacha(userData.rachaGimnasio || 0, !!newChecked.gym);
    const nuevaRachaCorrer = actualizarRacha(userData.rachaCorrer || 0, !!newChecked.correr);
    const nuevaRachaCaminar = actualizarRacha(userData.rachaCaminar || 0, !!newChecked.caminar);

    // Actualizar Firestore usuario
    await setDoc(userRef, {
      puntosDia,
      rachaGimnasio: nuevaRachaGimnasio,
      rachaCorrer: nuevaRachaCorrer,
      rachaCaminar: nuevaRachaCaminar,
    }, { merge: true });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center mt-8">
      <span className="text-lg font-bold text-blue-400 bg-gray-900 px-4 py-2 rounded-lg shadow-lg border border-blue-500 animate-pulse">
        Cargando check-list...
      </span>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-2xl p-5 mb-8 shadow-xl">
      <h3 className="text-2xl font-extrabold mb-4 text-blue-300 text-center drop-shadow">Check-list diaria de actividades</h3>
      <div className="flex flex-col gap-4 mb-6">
        {habits.length === 0 ? (
          <div className="text-center text-blue-200 font-semibold py-4">Agrega tu primer hábito para comenzar tu check-list.</div>
        ) : (
          habits.map(habit => {
            // Icono, color y puntos según tipo/nombre
            let icon = '✅';
            let badgeColor = 'bg-blue-500';
            let points = 10;
            const nameLower = habit.name?.toLowerCase() || '';
            if (habit.type === 'gym' || nameLower === 'gimnasio' || nameLower === 'gym') {
              icon = '🏋️‍♂️';
              badgeColor = 'bg-green-500';
              points = 10;
            } else if (habit.type === 'correr' || nameLower === 'correr') {
              icon = '🏃‍♂️';
              badgeColor = 'bg-blue-500';
              points = 15;
            } else if (habit.type === 'caminar' || nameLower === 'caminar') {
              icon = '🚶‍♂️';
              badgeColor = 'bg-cyan-300';
              points = 8;
            } else if (nameLower.includes('correr')) {
              icon = '🏃‍♂️';
              badgeColor = 'bg-blue-500';
              points = 15;
            } else if (nameLower.includes('caminar')) {
              icon = '🚶‍♂️';
              badgeColor = 'bg-cyan-300';
              points = 8;
            }
            // Progreso semanal
            const daysDone = weekActivities.filter(d => d[habit.type] || d[nameLower]).length;
            const meta = habit?.meta || habit?.goal || 1;
            return (
              <div key={habit.id || habit.type || habit.name} className="flex items-center justify-between bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 rounded-xl px-4 py-3 mb-1 shadow-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <input
                    type="checkbox"
                    checked={!!checked[habit.type] || !!checked[nameLower]}
                    onChange={() => handleCheck(habit.type || nameLower)}
                    disabled={!!checked[habit.type] || !!checked[nameLower]}
                    className={`w-6 h-6 transition-all duration-200 ${badgeColor}`}
                  />
                  <span className="font-bold text-white text-lg tracking-wide">{habit.name}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="bg-blue-500 text-white text-[0.66rem] font-bold px-2 py-1 rounded-full shadow">+{points} pts</span>
                  <span className={`${badgeColor} text-white text-[0.66rem] px-2 py-1 rounded-full font-semibold shadow`}>{daysDone}/{meta} esta semana</span>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Mensaje motivacional o error estilizado */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg px-3 py-2 mb-2 text-center font-semibold shadow">{error}</div>}
      {/* Calendario semanal debajo del checklist */}
      <div className="mt-8">
        <h4 className="text-lg font-bold text-blue-400 mb-3 text-center">Calendario {showMonth ? 'mensual' : 'semanal'}</h4>
        <div className="flex justify-center mb-4">
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition"
            onClick={() => setShowMonth((v) => !v)}
          >
            {showMonth ? 'Ver semana' : 'Ver mes completo'}
          </button>
        </div>
        <div className={`flex flex-col items-center mb-6`} style={showMonth ? {maxWidth: '370px'} : {}}>
          {showMonth
            ? (() => {
                // Cabecera fija de días (L M M J V S D)
                const weekDays = ['L','M','M','J','V','S','D'];
                const daysInMonth = dayjs(today).daysInMonth();
                const firstDay = dayjs(today).startOf('month');
                // Offset para semana que inicia en lunes: (firstDay.day() + 6) % 7
                const offset = (firstDay.day() + 6) % 7;
                const cells = [];
                for (let i = 0; i < offset; i++) {
                  cells.push(null); // vacíos antes del 1
                }
                for (let i = 0; i < daysInMonth; i++) {
                  cells.push(monthActivities[i]);
                }
                while (cells.length % 7 !== 0) {
                  cells.push(null); // vacíos al final
                }
                const rows = Math.ceil(cells.length / 7);
                return (
                  <>
                    <div className="flex flex-row justify-center gap-1 sm:gap-2 mb-2 w-full">
                      {weekDays.map((wd, i) => (
                        <span key={i} className="text-xs text-blue-200 font-bold w-10 text-center">{wd}</span>
                      ))}
                    </div>
                    {Array.from({ length: rows }).map((_, wi) => (
                      <div key={wi} className="flex flex-row justify-center gap-1 sm:gap-2 mb-2 w-full overflow-x-auto">
                        {cells.slice(wi * 7, wi * 7 + 7).map((act, i) => {
                          if (!act) {
                            return (
                              <div key={i + wi * 7} className="flex flex-col items-center w-10 group">
                                <span className="text-xs text-white mb-1 font-bold drop-shadow">&nbsp;</span>
                                <div className="w-10 h-10 rounded-full border-2 border-transparent" style={{ backgroundColor: 'transparent' }}></div>
                              </div>
                            );
                          }
                          const weekDayLetter = weekDays[dayjs(act.date).day() === 0 ? 6 : dayjs(act.date).day() - 1];
                          const colors = [];
                          if (act.gym) colors.push('#22c55e');
                          if (act.correr) colors.push('#3b82f6');
                          if (act.caminar) colors.push('#67e8f9');
                          let customBg = {};
                          let label = '';
                          if (colors.length === 0) {
                            customBg = { backgroundColor: '#181e2a' };
                          } else if (colors.length === 1) {
                            customBg = { backgroundColor: colors[0] };
                            label = '';
                          } else {
                            const percent = 100 / colors.length;
                            let gradient = 'conic-gradient(';
                            colors.forEach((c, idx) => {
                              const start = percent * idx;
                              const end = percent * (idx + 1);
                              gradient += `${c} ${start}%, ${c} ${end}%, `;
                            });
                            gradient = gradient.slice(0, -2) + ')';
                            customBg = { background: gradient };
                            label = '';
                          }
                          return (
                            <div key={i + wi * 7} className="flex flex-col items-center w-10 group">
                              <span className="text-xs text-white mb-1 font-bold drop-shadow">{weekDayLetter}</span>
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white shadow-lg border-2 border-white group-hover:scale-110 transition-transform duration-200`}
                                style={customBg}
                                title={colors.length === 0 ? 'Sin actividades' : colors.length === 1 ? (act.gym ? 'Gimnasio' : act.correr ? 'Correr' : 'Caminar') : 'Múltiples actividades'}
                              >
                                {label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </>
                );
              })()
            : (
                <div className="flex flex-row justify-center gap-2 sm:gap-4">
                  {/* Semana horizontal: cada día de izquierda a derecha */}
                  {[...Array(7)].map((_, i) => {
                    // Lunes a domingo
                    const weekDay = ['L','M','M','J','V','S','D'][i];
                    const act = weekActivities[i] || {};
                    const colors = [];
                    if (act.gym) colors.push('#22c55e');
                    if (act.correr) colors.push('#3b82f6');
                    if (act.caminar) colors.push('#67e8f9');
                    let customBg = {};
                    let label = '';
                    if (colors.length === 0) {
                      customBg = { backgroundColor: '#181e2a' };
                      label = '';
                    } else if (colors.length === 1) {
                      customBg = { backgroundColor: colors[0] };
                      label = '';
                    } else {
                      const percent = 100 / colors.length;
                      let gradient = 'conic-gradient(';
                      colors.forEach((c, idx) => {
                        const start = percent * idx;
                        const end = percent * (idx + 1);
                        gradient += `${c} ${start}%, ${c} ${end}%, `;
                      });
                      gradient = gradient.slice(0, -2) + ')';
                      customBg = { background: gradient };
                      label = '';
                    }
                    return (
                      <div key={i} className="flex flex-col items-center w-8 h-14 sm:w-12 group">
                        <span className="text-xs sm:text-base text-white mb-1 sm:mb-2 font-bold drop-shadow">{weekDay}</span>
                        <div
                          className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-extrabold text-white shadow-lg border-2 border-white group-hover:scale-110 transition-transform duration-200`}
                          style={customBg}
                          title={colors.length === 0 ? 'Sin actividades' : colors.length === 1 ? (act.gym ? 'Gimnasio' : act.correr ? 'Correr' : 'Caminar') : 'Múltiples actividades'}
                        >
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
        </div>
        {/* Barra de progreso semanal */}
        {!showMonth && habits.length > 0 && (() => {
          // Sumar metas semanales de todas las actividades
          let totalMeta = 0;
          let totalDone = 0;
          ACTIVITIES.forEach(act => {
            const habit = habits.find(h => h.type === act.key || h.name?.toLowerCase() === act.key);
            // Si no hay meta definida, cuenta como 0 (no 1 por defecto)
            const meta = (habit && (typeof habit.meta === 'number' || typeof habit.goal === 'number'))
              ? (habit.meta ?? habit.goal ?? 0)
              : 0;
            totalMeta += meta;
            const done = weekActivities.filter(d => d[act.key]).length;
            totalDone += done;
          });
          const percent = totalMeta > 0 ? Math.round((totalDone / totalMeta) * 100) : 0;
          return (
            <div className="w-full max-w-full px-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-200 font-semibold">Progreso semanal</span>
                <span className="text-sm text-blue-400 font-bold">{totalDone}/{totalMeta} ({percent}%)</span>
              </div>
              <div className="w-full h-4 bg-gray-600 rounded-full overflow-hidden shadow max-w-full">
                <div
                  className="h-4 bg-gradient-to-r from-green-400 via-blue-400 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          );
        })()}
      </div>
    {/* Formulario para agregar hábito */}
    {(
      <div className="mt-8 bg-gray-900 rounded-xl p-4 shadow-lg">
        <h4 className="text-lg font-bold text-blue-400 mb-3 text-center">Agregar nuevo hábito</h4>
        <form
          className="flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setAddHabitError('');
            setAddHabitSuccess('');
            if (!user) {
              setAddHabitError('Usuario no autenticado.');
              return;
            }
            try {
              // Mapear el tipo a nombre legible
              const typeToName = {
                gym: 'Gimnasio',
                correr: 'Correr',
                caminar: 'Caminar',
              };
              const habitObj = {
                owner: user.uid,
                name: typeToName[newHabitType] || newHabitType,
                type: newHabitType,
                meta: Number(newHabitMeta) || 1,
                createdAt: new Date().toISOString(),
              };
              // Si ya existe, actualiza el hábito anterior
              await setDoc(doc(db, 'habits', `${user.uid}_${newHabitType}`), habitObj, { merge: true });
              setAddHabitSuccess('¡Hábito guardado!');
              setNewHabitName('');
              setNewHabitType('gym');
              setNewHabitMeta(1);
              const habitsData = await getHabitsByUser(user.uid);
              setHabits(habitsData);
            } catch (err) {
              let msg = 'Error al guardar el hábito.';
              if (err && err.message) {
                msg += `\n${err.message}`;
              }
              setAddHabitError(msg);
            }
          }}
        >
          <div className="text-gray-300 text-sm font-semibold mb-1">
            Elegí la categoría del hábito :
          </div>
          <select
            className="rounded px-3 py-2 bg-gray-800 text-white border border-gray-700 focus:outline-none"
            value={newHabitType}
            onChange={e => setNewHabitType(e.target.value)}
          >
            <option value="gym">Gimnasio</option>
            <option value="correr">Correr</option>
            <option value="caminar">Caminar</option>
          </select>
          <div className="flex flex-col gap-1">
            <label className="text-gray-300 text-sm font-semibold" htmlFor="metaInput">
              ¿Cuántas veces por semana quieres cumplir este hábito?
            </label>
            <input
              id="metaInput"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="rounded px-3 py-2 bg-gray-800 text-white border border-gray-700 focus:outline-none"
              placeholder="Ej: 3"
              value={newHabitMeta === 0 ? '' : newHabitMeta}
              onChange={e => {
                // Permitir vacío, limpiar ceros a la izquierda
                let val = e.target.value.replace(/^0+/, '');
                if (val === '') {
                  setNewHabitMeta('');
                } else if (/^\d+$/.test(val)) {
                  setNewHabitMeta(Number(val));
                }
              }}
              maxLength={2}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition"
          >
            Guardar hábito
          </button>
          {/* Mensajes de error y éxito para el formulario de hábito */}
          {addHabitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg px-3 py-2 mt-2 text-center font-semibold shadow">
              {addHabitError}
            </div>
          )}
          {addHabitSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 text-sm rounded-lg px-3 py-2 mt-2 text-center font-semibold shadow">
              {addHabitSuccess}
            </div>
          )}
        </form>
      </div>
    )}
  </div>
);
}
