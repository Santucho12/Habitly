

import React, { useEffect, useState } from 'react';
import { useUserNames } from '../../hooks/useUserNames';
import { getMonthlyRanking } from '../../services/ranking';
import { calcularYActualizarRanking } from '../../utils/calcularRanking';
import dayjs from 'dayjs';

export default function EstadisticasComparativo({ usuario, companero }) {
  const { myName, companionName } = useUserNames();
  const usuarioId = usuario?.id || usuario?.uid;
  const companeroId = companero?.id || companero?.uid;
  const [puntosUsuario, setPuntosUsuario] = useState(0);
  const [puntosCompanero, setPuntosCompanero] = useState(0);
  const [rankingUsuario, setRankingUsuario] = useState(2);
  const [rankingCompanero, setRankingCompanero] = useState(2);
  const mesActual = dayjs().format('YYYY-MM');
  useEffect(() => {
    async function fetchStats() {
      // Actualiza ranking y puntos automáticamente al montar
      await calcularYActualizarRanking(mesActual);
      const ranking = await getMonthlyRanking(mesActual);
      let puntosU = 0;
      let puntosC = 0;
      if (ranking && ranking.usuarios) {
        const user = ranking.usuarios.find(u => u.userId === usuarioId);
        const compa = ranking.usuarios.find(u => u.userId === companeroId);
        puntosU = user?.puntos ?? 0;
        puntosC = compa?.puntos ?? 0;
      }
      setPuntosUsuario(puntosU);
      setPuntosCompanero(puntosC);
      // Ranking: el que más puntos tiene es 1, el otro 2
      if (puntosU === puntosC) {
        setRankingUsuario(1);
        setRankingCompanero(1);
      } else if (puntosU > puntosC) {
        setRankingUsuario(1);
        setRankingCompanero(2);
      } else {
        setRankingUsuario(2);
        setRankingCompanero(1);
      }
    }
    fetchStats();
  }, [usuarioId, companeroId, mesActual]);

  return (
    <div className="grid grid-cols-2 gap-[62px] w-full max-w-xl mx-auto my-8">
      {/* Card Usuario */}
      <div className="rounded-3xl border-4 border-blue-900 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 shadow-2xl p-6 flex flex-col items-center justify-center text-white w-64" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)', transform: 'scale(0.6)', transformOrigin: 'top left', marginTop: '-120px' }}>
        <div className="mb-2 text-3xl" style={{fontSize: '1.8rem'}}>🏆</div>
        <div className="font-extrabold text-2xl tracking-wide mb-1 uppercase">{usuario?.nombre || myName}</div>
        <div className="mb-3 flex gap-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-blue-300 font-bold">Puntaje</span>
            <span className="text-2xl font-extrabold text-blue-400 drop-shadow">
              {puntosUsuario}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-yellow-300 font-bold">Ranking</span>
            <span className="text-2xl font-extrabold text-yellow-400 drop-shadow">
              {rankingUsuario}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-green-300 font-bold">Hábitos</span>
            <span className="text-2xl font-extrabold text-green-400 drop-shadow">3</span>
          </div>
        </div>
      </div>
      {/* Card Compañero */}
      <div className="rounded-3xl border-4 border-pink-900 bg-gradient-to-br from-gray-900 via-pink-900 to-gray-800 shadow-2xl p-6 flex flex-col items-center justify-center text-white w-64" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)', transform: 'scale(0.6)', transformOrigin: 'top left', marginTop: '-120px', marginLeft: '-86px' }}>
        <div className="mb-2 text-4xl">🏋️‍♂️</div>
        <div className="font-extrabold text-2xl tracking-wide mb-1 uppercase">{companero?.nombre || companionName}</div>
        <div className="mb-3 flex gap-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-blue-300 font-bold">Puntaje</span>
            <span className="text-2xl font-extrabold text-blue-400 drop-shadow">
              {puntosCompanero}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-yellow-300 font-bold">Ranking</span>
            <span className="text-2xl font-extrabold text-yellow-400 drop-shadow">
              {rankingCompanero}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-green-300 font-bold">Hábitos</span>
            <span className="text-2xl font-extrabold text-green-400 drop-shadow">3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
