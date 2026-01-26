import React, { useEffect, useState } from 'react';
import { getMonthlyRanking } from '../../services/ranking';
import dayjs from 'dayjs';
import { FaMedal, FaUserFriends, FaStar, FaBolt } from 'react-icons/fa';

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
    <div className="flex justify-center gap-10 mb-8 mt-2 scale-[0.95]">
      {/* Card Usuario */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-blue-800 rounded-3xl px-8 py-5 flex flex-col items-center shadow-2xl min-w-[150px] border-2 border-blue-400/60">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 rounded-full p-2 shadow-lg border-4 border-blue-200"><FaMedal className="text-yellow-300 text-2xl" /></div>
        <span className="text-white font-extrabold text-lg mb-1 mt-4 tracking-wide flex items-center gap-2"><FaStar className="text-blue-300" />Tú</span>
        <span className="text-3xl font-black text-blue-200 drop-shadow mb-1">{usuario.puntosTotales}</span>
        <span className="text-xs text-blue-200 mb-2">Puntos totales</span>
        <span className="inline-flex items-center gap-1 text-base font-bold text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full shadow mt-1"><FaBolt className="text-yellow-300" />+{usuario.puntosDia} hoy</span>
      </div>
      {/* Card Compañero */}
      <div className="relative bg-gradient-to-br from-pink-900 via-pink-700 to-pink-800 rounded-3xl px-8 py-5 flex flex-col items-center shadow-2xl min-w-[150px] border-2 border-pink-400/60">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-pink-600 rounded-full p-2 shadow-lg border-4 border-pink-200"><FaUserFriends className="text-yellow-200 text-2xl" /></div>
        <span className="text-white font-extrabold text-sm mb-1 mt-4 tracking-wide flex items-center gap-1"><FaStar className="text-pink-300 text-sm" />Compañero</span>
        <span className="text-3xl font-black text-pink-200 drop-shadow mb-1">{companero.puntosTotales}</span>
        <span className="text-xs text-pink-200 mb-2">Puntos totales</span>
        <span className="inline-flex items-center gap-1 text-base font-bold text-pink-400 bg-pink-950/60 px-3 py-1 rounded-full shadow mt-1"><FaBolt className="text-yellow-200" />+{companero.puntosDia} hoy</span>
      </div>
    </div>
  );
}
