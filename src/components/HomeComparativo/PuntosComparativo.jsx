import React, { useEffect, useState } from 'react';
import { getMonthlyRanking } from '../services/ranking';
import dayjs from 'dayjs';

export default function PuntosComparativo({ usuarioId, companeroId }) {
  const [usuario, setUsuario] = useState({ puntosTotales: 0, puntosDia: 0 });
  const [companero, setCompanero] = useState({ puntosTotales: 0, puntosDia: 0 });
  const mes = dayjs().format('YYYY-MM');
  const hoy = dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    async function fetchPuntos() {
      const ranking = await getMonthlyRanking(mes);
      if (ranking && ranking.usuarios) {
        const user = ranking.usuarios.find(u => u.userId === usuarioId);
        const compa = ranking.usuarios.find(u => u.userId === companeroId);
        setUsuario({
          puntosTotales: user?.puntos ?? 0,
          puntosDia: user?.puntosDia ?? 0
        });
        setCompanero({
          puntosTotales: compa?.puntos ?? 0,
          puntosDia: compa?.puntosDia ?? 0
        });
      }
    }
    fetchPuntos();
  }, [usuarioId, companeroId, mes, hoy]);

  return (
    <div className="flex justify-center gap-8 mb-6 mt-2">
      <div className="bg-blue-900/80 rounded-2xl px-6 py-3 flex flex-col items-center shadow-lg min-w-[120px]">
        <span className="text-white font-bold text-lg mb-1">Tú</span>
        <span className="text-2xl font-extrabold text-blue-300">{usuario.puntosTotales}</span>
        <span className="text-xs text-blue-200 mt-1">Puntos totales</span>
        <span className="text-base font-bold text-blue-400 mt-2">+{usuario.puntosDia} hoy</span>
      </div>
      <div className="bg-pink-900/80 rounded-2xl px-6 py-3 flex flex-col items-center shadow-lg min-w-[120px]">
        <span className="text-white font-bold text-lg mb-1">Compañero</span>
        <span className="text-2xl font-extrabold text-pink-300">{companero.puntosTotales}</span>
        <span className="text-xs text-pink-200 mt-1">Puntos totales</span>
        <span className="text-base font-bold text-pink-400 mt-2">+{companero.puntosDia} hoy</span>
      </div>
    </div>
  );
}
