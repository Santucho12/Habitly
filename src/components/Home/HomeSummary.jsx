import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDailyActivity } from '../../services/habits';
import { getDailyMeals } from '../../services/meals';
import { getMonthlyProgress } from '../../services/progress';
import { getMonthlyRanking } from '../../services/ranking';
import dayjs from 'dayjs';
import SummaryCard from './SummaryCard';
import ProgressBar from './ProgressBar';

export default function HomeSummary() {
  const { user } = useAuth();
  const [activity, setActivity] = useState(null);
  const [meals, setMeals] = useState(null);
  const [progress, setProgress] = useState(null);
  const [ranking, setRanking] = useState(null);
  const fecha = dayjs().format('YYYY-MM-DD');
  const mes = dayjs().format('YYYY-MM');

  useEffect(() => {
    if (!user) return;
    getDailyActivity(user.uid, fecha).then(setActivity);
    getDailyMeals(user.uid, fecha).then(setMeals);
    getMonthlyProgress(user.uid, mes).then(setProgress);
    getMonthlyRanking(mes).then(setRanking);
  }, [user, fecha, mes]);

  // Ejemplo de cálculo de puntos y racha
  const puntosHoy = (activity?.puntos || 0) + (meals ? Object.values(meals).reduce((acc, m) => acc + (m?.puntuacion || 0), 0) : 0);
  const racha = activity?.racha || 0;
  const peso = progress?.peso || '-';
  const rankingPos = ranking?.usuarios?.find(u => u.userId === user?.uid)?.posicion || '-';
  const puntosMax = 100; // Puedes ajustar el máximo según la lógica de tu app

  return (
    <div className="flex flex-wrap gap-4 justify-center my-6">
      <SummaryCard title="Puntos hoy" value={puntosHoy} icon="🏅" color="bg-blue-700">
        <ProgressBar value={puntosHoy} max={puntosMax} color="bg-blue-400" label="Progreso diario" />
      </SummaryCard>
      <SummaryCard title="Racha" value={racha} icon="🔥" color="bg-orange-600" />
      <SummaryCard title="Peso actual" value={peso} icon="⚖️" color="bg-green-700" />
      <SummaryCard title="Ranking" value={rankingPos} icon="🏆" color="bg-yellow-600" />
    </div>
  );
}
