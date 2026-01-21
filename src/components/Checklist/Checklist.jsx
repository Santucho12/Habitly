import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { getHabitsByUser } from '../../services/habitService';
import { saveDailyActivity, getDailyActivity } from '../../services/habits';
import { calcularPuntosDia } from '../../utils/points';
import { actualizarRacha } from '../../utils/streaks';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import dayjs from 'dayjs';

const ACTIVITIES = [
  { key: 'gym', label: 'Gimnasio', points: 10 },
  { key: 'correr', label: 'Correr', points: 15 },
  { key: 'caminar', label: 'Caminar', points: 8 },
];

export default function Checklist() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    <div className="bg-gray-700 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-bold mb-2">Check-list diaria de actividades</h3>
      <div className="flex flex-col gap-2">
        {ACTIVITIES.map(act => (
          <label key={act.key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!checked[act.key]}
              onChange={() => handleCheck(act.key)}
              disabled={!!checked[act.key]}
            />
            <span>{act.label}</span>
          </label>
        ))}
      </div>
      {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
    </div>
  );
}
