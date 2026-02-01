import React, { useEffect, useState } from 'react';
import { useUserNames } from '../../hooks/useUserNames';
import { getMonthlyRanking } from '../../services/ranking';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';

export default function ComparacionCompanero() {
  const { myName, companionName } = useUserNames();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getAuth().currentUser;
  const mes = dayjs().format('YYYY-MM');

  useEffect(() => {
    getMonthlyRanking(mes).then(data => {
      setRanking(data?.usuarios || []);
      setLoading(false);
    });
  }, [mes]);

  if (loading) return <div>Cargando comparación...</div>;
  if (!ranking.length) return <div>No hay datos de comparación este mes.</div>;

  const yo = ranking.find(u => u.userId === user?.uid);
  const compa = ranking.find(u => u.userId !== user?.uid);

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-bold mb-2">Comparación con {companionName}</h3>
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
        <div className="bg-blue-900 p-4 rounded-xl w-48 text-center">
          <div className="font-bold text-blue-300">{myName}</div>
          <div className="text-2xl">{yo?.puntos ?? '-'}</div>
          <div className="text-sm">Posición: {yo?.posicion ?? '-'}</div>
        </div>
        <span className="text-2xl">vs</span>
        <div className="bg-green-900 p-4 rounded-xl w-48 text-center">
          <div className="font-bold text-green-300">{companionName}</div>
          <div className="text-2xl">{compa?.puntos ?? '-'}</div>
          <div className="text-sm">Posición: {compa?.posicion ?? '-'}</div>
        </div>
      </div>
    </div>
  );
}
