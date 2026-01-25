import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { getHabitsByUser } from '../../services/habitService';
import { saveDailyActivity, getDailyActivity } from '../../services/habits';
import { calcularPuntosDia } from '../../utils/points';
import { actualizarRacha } from '../../utils/streaks';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(weekOfYear);

const ACTIVITIES = [
  { key: 'gym', label: 'Gimnasio', points: 10 },
  { key: 'correr', label: 'Correr', points: 15 },
  { key: 'caminar', label: 'Caminar', points: 8 },
];

export default function ChecklistComparativo({ usuarioType = 'yo', usuarioId = null }) {
  const { user } = useAuth();
  // Si es "yo" usamos el usuario actual, si es "companero" usamos el id pasado por prop (o null para ejemplo)
  const uid = usuarioType === 'yo' ? user?.uid : usuarioId;
  const [habits, setHabits] = useState([]);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = dayjs().format('YYYY-MM-DD');
  const weekNumber = dayjs().week();
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
      if (!uid) return;
      const habitsData = await getHabitsByUser(uid);
      setHabits(habitsData);
      const todayData = await getDailyActivity(uid, today);
      setChecked(todayData || {});
      // Semana
      const weekStart = dayjs().startOf('week');
      let weekArr = [];
      for (let i = 0; i < 7; i++) {
        const d = weekStart.add(i, 'day').format('YYYY-MM-DD');
        // eslint-disable-next-line no-await-in-loop
        const act = await getDailyActivity(uid, d);
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
        const act = await getDailyActivity(uid, d);
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
  }, [uid, today]);

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

  if (loading) return <div>Cargando check-list...</div>;

  return (
    <div
      className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-2xl p-5 mb-8 shadow-xl"
      style={{ transform: 'scale(0.5)', transformOrigin: 'top left' }}
    >
      {/* Título eliminado por solicitud */}
      <div className="flex flex-col gap-4 mb-6">
        {ACTIVITIES.map(act => {
          const daysDone = weekActivities.filter(d => d[act.key]).length;
          // Buscar meta semanal para la actividad
          const habit = habits.find(h => h.type === act.key || h.name?.toLowerCase() === act.key);
          const meta = habit?.meta || habit?.goal || 1;
          // Color badge según actividad
          let badgeColor = '';
          if (act.key === 'gym') badgeColor = 'bg-green-500';
          else if (act.key === 'caminar') badgeColor = 'bg-cyan-300';
          else if (act.key === 'correr') badgeColor = 'bg-blue-500';
          return (
            <div key={act.key} className="flex items-center justify-between bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 rounded-xl px-4 py-3 mb-1 shadow-lg border border-gray-700">
              <div className="flex items-center gap-3">
                {/* Iconos grandes */}
                {act.key === 'gym' && <span role="img" aria-label="Gimnasio" className="text-2xl">🏋️‍♂️</span>}
                {act.key === 'correr' && <span role="img" aria-label="Correr" className="text-2xl">🏃‍♂️</span>}
                {act.key === 'caminar' && <span role="img" aria-label="Caminar" className="text-2xl">🚶‍♂️</span>}
                <input
                  type="checkbox"
                  checked={!!checked[act.key]}
                  onChange={usuarioType === 'yo' ? () => handleCheck(act.key) : undefined}
                  disabled={usuarioType !== 'yo' || !!checked[act.key]}
                  className={`w-6 h-6 transition-all duration-200 ${
                    act.key === 'gym' ? 'accent-green-500' :
                    act.key === 'correr' ? 'accent-blue-500' :
                    act.key === 'caminar' ? 'accent-cyan-300' : 'accent-blue-500'
                  } ${usuarioType !== 'yo' ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                <span className="font-bold text-white text-lg tracking-wide">{act.label}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="bg-blue-500 text-white text-[7px] font-bold px-2 py-0.5 rounded-full shadow">+{act.points} pts</span>
                <span className={`${badgeColor} text-white text-[7px] px-2 py-0.5 rounded-full font-semibold shadow`}>{daysDone}/{meta} esta semana</span>
              </div>
            </div>
          );
        })}
      </div>
      {/* Mensaje motivacional o error estilizado */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg px-3 py-2 mb-2 text-center font-semibold shadow">{error}</div>}
      {/* Calendario semanal debajo del checklist */}
      <div className="mt-8">
        <div className={`flex flex-col items-center mb-6`} style={showMonth ? {maxWidth: '370px'} : {}}>
          {showMonth
            ? (() => {
                // ...existing code for month view...
                const weeks = [];
                for (let i = 0; i < monthActivities.length; i += 7) {
                  weeks.push(monthActivities.slice(i, i + 7));
                }
                return weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-row justify-center gap-1 sm:gap-2 mb-2 w-full overflow-x-auto">
                    {/* ...existing code for each day in month view... */}
                    {week.map((act, i) => {
                      // ...existing code...
                      const weekDayLetter = ['L','M','M','J','V','S','D'][dayjs(act.date).day()];
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
                        label = act.gym ? 'G' : act.correr ? 'R' : 'C';
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
                ));
              })()
            : (
                <div className="flex flex-row justify-center gap-2 sm:gap-4">
                  {/* Semana horizontal: cada día de izquierda a derecha */}
                  {[...Array(7)].map((_, i) => {
                    const day = dayjs().startOf('week').add(i, 'day');
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
                    } else if (colors.length === 1) {
                      customBg = { backgroundColor: colors[0] };
                      label = act.gym ? 'G' : act.correr ? 'R' : 'C';
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
        {!showMonth && (() => {
          // Sumar metas semanales de todas las actividades
          let totalMeta = 0;
          let totalDone = 0;
          ACTIVITIES.forEach(act => {
            const habit = habits.find(h => h.type === act.key || h.name?.toLowerCase() === act.key);
            const meta = habit?.meta || habit?.goal || 1;
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
          </div>
  );
}