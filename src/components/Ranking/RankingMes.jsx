import React, { useEffect, useState } from 'react';
import { useUserNames } from '../../hooks/useUserNames';
import { getMonthlyRanking } from '../../services/ranking';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';

export default function RankingMes() {
  const { myName } = useUserNames();
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

  if (loading) return <div>Cargando ranking...</div>;
  if (!ranking.length) return <div>No hay ranking este mes.</div>;

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-bold mb-2">Ranking mensual</h3>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="py-1">Posición</th>
            <th className="py-1">Usuario</th>
            <th className="py-1">Puntos</th>
          </tr>
        </thead>
        <tbody>
          {ranking.sort((a,b)=>a.posicion-b.posicion).map((u) => (
            <tr key={u.userId} className={u.userId === user?.uid ? 'bg-blue-900 text-blue-300 font-bold' : ''}>
              <td className="py-1">{u.posicion}</td>
              <td className="py-1">{u.userId === user?.uid ? myName : u.userId}</td>
              <td className="py-1">{u.puntos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
