
import React, { useEffect, useState } from 'react';
import { getMonthlyRanking } from '../../services/ranking';
import dayjs from 'dayjs';

export default function EstadisticasComparativo({ usuario, companero }) {
  const [statsUsuario, setStatsUsuario] = useState({ puntaje: null, ranking: null, habitos: null });
  const [statsCompanero, setStatsCompanero] = useState({ puntaje: null, ranking: null, habitos: null });
  const mes = dayjs().format('YYYY-MM');

  useEffect(() => {
    async function fetchStats(user, setStats) {
      if (!user?.id) return;
      const rankingData = await getMonthlyRanking(mes);
      let puntaje = null, ranking = null, habitos = null;
      if (rankingData && rankingData.usuarios) {
        const found = rankingData.usuarios.find(u => u.userId === user.id);
        if (found) {
          puntaje = found.puntos;
          ranking = found.posicion;
          habitos = found.habitosCumplidos;
        }
      }
      setStats({ puntaje, ranking, habitos });
    }
    fetchStats(usuario, setStatsUsuario);
    fetchStats(companero, setStatsCompanero);
  }, [usuario, companero, mes]);

  return (
    <div className="grid grid-cols-2 gap-[62px] w-full max-w-xl mx-auto my-8">
      {/* Card Usuario */}
      <div className="rounded-3xl border-4 border-blue-900 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 shadow-2xl p-6 flex flex-col items-center justify-center text-white w-64" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)', transform: 'scale(0.6)', transformOrigin: 'top left', marginTop: '-120px' }}>
        <div className="mb-2 text-4xl">🏅</div>
        <div className="font-extrabold text-2xl tracking-wide mb-1 uppercase">{usuario?.nombre || 'Tú'}</div>
        <div className="mb-3 flex gap-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-blue-300 font-bold">Puntaje</span>
            <span className="text-2xl font-extrabold text-blue-400 drop-shadow">{statsUsuario.puntaje ?? '-'}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-yellow-300 font-bold">Ranking</span>
            <span className="text-2xl font-extrabold text-yellow-400 drop-shadow">{statsUsuario.ranking ?? '-'}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-green-300 font-bold">Hábitos</span>
            <span className="text-2xl font-extrabold text-green-400 drop-shadow">{statsUsuario.habitos ?? '-'}</span>
          </div>
        </div>
      </div>
      {/* Card Compañero */}
      <div className="rounded-3xl border-4 border-pink-900 bg-gradient-to-br from-gray-900 via-pink-900 to-gray-800 shadow-2xl p-6 flex flex-col items-center justify-center text-white w-64" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)', transform: 'scale(0.6)', transformOrigin: 'top left', marginTop: '-120px', marginLeft: '-86px' }}>
        <div className="mb-2 text-4xl">🏋️‍♂️</div>
        <div className="font-extrabold text-2xl tracking-wide mb-1 uppercase">{companero?.nombre || 'Compañero'}</div>
        <div className="mb-3 flex gap-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-blue-300 font-bold">Puntaje</span>
            <span className="text-2xl font-extrabold text-blue-400 drop-shadow">{statsCompanero.puntaje ?? '-'}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-yellow-300 font-bold">Ranking</span>
            <span className="text-2xl font-extrabold text-yellow-400 drop-shadow">{statsCompanero.ranking ?? '-'}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-green-300 font-bold">Hábitos</span>
            <span className="text-2xl font-extrabold text-green-400 drop-shadow">{statsCompanero.habitos ?? '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
