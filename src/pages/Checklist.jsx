import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { getHabitsByUser } from '../services/habitService';
import { saveDailyActivity, getDailyActivity } from '../services/habits';
import { calcularPuntosDia } from '../utils/points';
import { actualizarRacha } from '../utils/streaks';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(weekOfYear);

const ACTIVITIES = [
  { key: 'gym', label: 'Gimnasio', points: 10 },
  { key: 'correr', label: 'Correr', points: 15 },
  { key: 'caminar', label: 'Caminar', points: 8 },
];

export default function ChecklistPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [animKey, setAnimKey] = useState('');
  const today = dayjs().format('YYYY-MM-DD');
  const weekNumber = dayjs().week();

  useEffect(() => {
    if (user) {
      getHabitsByUser(user.uid).then(setHabits);
      getDailyActivity(user.uid, today).then((data) => {
        setChecked(data || {});
        setLoading(false);
      });
    }
  }, [user, today]);

  const handleCheck = async (key) => {
    if (checked[key]) return; // No desmarcar
    if (dayjs().format('YYYY-MM-DD') !== today) {
      setError('Solo puedes marcar actividades del día actual.');
      return;
    }
    const habit = habits.find(h => h.type === key || h.name?.toLowerCase() === key);
    if (!habit) {
      setError('No tienes meta para esta actividad.');
      return;
    }
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
    const newChecked = { ...checked, [key]: true };
    setChecked(newChecked);
    setError('');
    setSuccess('¡Actividad marcada! ¡Sigue así!');
    setAnimKey(key);
    setTimeout(() => {
      setSuccess('');
      setAnimKey('');
    }, 1200);
    await saveDailyActivity(user.uid, today, newChecked);
    // --- Lógica de puntos y rachas ---
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    let userData = userSnap.exists() ? userSnap.data() : {};
    const puntosDia = calcularPuntosDia({
      gym: newChecked.gym,
      correr: newChecked.correr,
      caminar: newChecked.caminar,
    });
    const nuevaRachaGimnasio = actualizarRacha(userData.rachaGimnasio || 0, !!newChecked.gym);
    const nuevaRachaCorrer = actualizarRacha(userData.rachaCorrer || 0, !!newChecked.correr);
    const nuevaRachaCaminar = actualizarRacha(userData.rachaCaminar || 0, !!newChecked.caminar);
    await setDoc(userRef, {
      puntosDia,
      rachaGimnasio: nuevaRachaGimnasio,
      rachaCorrer: nuevaRachaCorrer,
      rachaCaminar: nuevaRachaCaminar,
    }, { merge: true });
  };

  if (loading) return <div className="text-white" role="status" aria-live="polite">Cargando check-list...</div>;

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-6 mt-8" role="form" aria-labelledby="checklist-title">
      <h2 id="checklist-title" className="text-2xl font-bold text-blue-300 mb-4 text-center">Check-list diaria de actividades</h2>
      {habits.length === 0 ? (
        <div className="text-gray-400 text-center mt-8">
          <img src="/assets/images/empty-habits.svg" alt="Sin hábitos" className="mx-auto mb-4 w-24 h-24 opacity-80" />
          <div className="font-semibold">¡Comienza tu primer hábito!</div>
          <div className="text-sm text-gray-400">Agrega un hábito físico para empezar tu progreso.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4" role="group" aria-describedby="checklist-desc">
          <span id="checklist-desc" className="sr-only">Lista de actividades diarias para marcar como completadas</span>
          {ACTIVITIES.map(act => (
            <label
              key={act.key}
              className={`flex items-center gap-4 bg-gray-700 rounded-xl px-4 py-3 shadow transition-all ${checked[act.key] ? 'opacity-60' : 'hover:bg-gray-600'} ${animKey === act.key ? 'ring-4 ring-green-400/60 animate-pulse' : ''}`}
              aria-checked={!!checked[act.key]}
              tabIndex={0}
              role="checkbox"
              aria-label={`Marcar ${act.label} como completado`}
              onKeyDown={e => {
                if (e.key === ' ' || e.key === 'Enter') handleCheck(act.key);
              }}
            >
              <input
                type="checkbox"
                checked={!!checked[act.key]}
                onChange={() => handleCheck(act.key)}
                disabled={!!checked[act.key]}
                className="w-5 h-5 accent-blue-500"
                aria-label={act.label}
                tabIndex={-1}
              />
              <span className="text-lg font-semibold flex-1">{act.label}</span>
              <span className="text-xs text-gray-300">+{act.points} pts</span>
            </label>
          ))}
        </div>
      )}
      <div aria-live="polite" aria-atomic="true">
        {success && <div className="text-green-400 text-center font-bold mt-4 animate-bounce" role="status">{success}</div>}
        {error && <div className="text-red-400 text-sm mt-4 text-center font-semibold" role="alert">{error}</div>}
      </div>
    </div>
  );
}
