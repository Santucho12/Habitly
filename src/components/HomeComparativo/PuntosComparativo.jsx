import React, { useEffect, useState } from 'react';
import { useUserNames } from '../../hooks/useUserNames';
import { getMonthlyRanking } from '../../services/ranking';
import dayjs from 'dayjs';
import { FaMedal, FaUserFriends, FaStar, FaBolt } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function PuntosComparativo({ usuarioId, companeroId }) {
  const { myName, companionName } = useUserNames();
  const [usuario, setUsuario] = useState({ puntosTotales: 0, puntosDia: 0 });
  const [companero, setCompanero] = useState({ puntosTotales: 0, puntosDia: 0 });
  const [historial, setHistorial] = useState([]);
  const mes = dayjs().format('YYYY-MM');
  const hoy = dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    async function fetchHistorial() {
      if (!usuarioId) return;
      // Leer puntosHistoricos de Firestore para usuario y compañero
      const userRef = doc(db, 'users', usuarioId);
      const userSnap = await getDoc(userRef);
      let puntosHistoricosYo = {};
      let puntosHistoricosCompa = {};
      let compaId = companeroId;
      if (userSnap.exists()) {
        puntosHistoricosYo = userSnap.data().puntosHistoricos || {};
        if (!compaId) compaId = userSnap.data().companeroId;
      }
      if (compaId) {
        const compaRef = doc(db, 'users', compaId);
        const compaSnap = await getDoc(compaRef);
        if (compaSnap.exists()) {
          puntosHistoricosCompa = compaSnap.data().puntosHistoricos || {};
        }
      }
      // Obtener todos los meses desde enero hasta el mes actual del año actual
      const meses = [];
      const now = dayjs();
      const year = now.year();
      const mesActual = now.month() + 1;
      for (let m = 1; m <= mesActual; m++) {
        const mesStr = `${year}-${m.toString().padStart(2, '0')}`;
        meses.push(mesStr);
      }
      const historialData = meses.map(m => ({
        mes: m,
        yo: puntosHistoricosYo[m] || 0,
        compa: puntosHistoricosCompa[m] || 0
      }));
      setHistorial(historialData);
    }
    fetchHistorial();
  }, [usuarioId, companeroId, mes, hoy]);

  return (
    <div className="flex justify-center gap-10 mb-8 mt-2 scale-[0.95]">
      {/* Card Usuario */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-blue-800 rounded-3xl px-4 py-5 flex flex-col items-center shadow-2xl w-[170px] min-w-0 border-2 border-blue-400/60">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 rounded-full p-2 shadow-lg border-4 border-blue-200"><FaMedal className="text-yellow-300 text-2xl" /></div>
        <span className="text-white font-extrabold text-sm mb-1 mt-4 tracking-wide flex items-center gap-2"><FaStar className="text-blue-300 text-sm" />{myName}</span>
        <span className="text-3xl font-black text-blue-200 drop-shadow mb-1">{historial.length > 0 ? historial[historial.length-1].yo : 0}</span>
        <span className="text-xs text-blue-200 mb-2">Puntos totales</span>
        {/* El valor de hoy puede mantenerse igual, o puedes ajustarlo si quieres que también sea consistente */}
        <span className="inline-flex items-center gap-1 text-base font-bold text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full shadow mt-1"><FaBolt className="text-yellow-300" />{usuario.puntosDia > 0 ? `+${usuario.puntosDia}` : usuario.puntosDia} hoy</span>
      </div>
      {/* Card Compañero */}
      <div className="relative bg-gradient-to-br from-pink-900 via-pink-700 to-pink-800 rounded-3xl px-4 py-5 flex flex-col items-center shadow-2xl w-[170px] min-w-0 border-2 border-pink-400/60">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-pink-600 rounded-full p-2 shadow-lg border-4 border-pink-200"><FaUserFriends className="text-yellow-200 text-2xl" /></div>
        <span className="text-white font-extrabold text-sm mb-1 mt-4 tracking-wide flex items-center gap-1"><FaStar className="text-pink-300 text-sm" />{companionName}</span>
        <span className="text-3xl font-black text-pink-200 drop-shadow mb-1">{historial.length > 0 ? historial[historial.length-1].compa : 0}</span>
        <span className="text-xs text-pink-200 mb-2">Puntos totales</span>
        <span className="inline-flex items-center gap-1 text-base font-bold text-pink-400 bg-pink-950/60 px-3 py-1 rounded-full shadow mt-1"><FaBolt className="text-yellow-200" />{companero.puntosDia > 0 ? `+${companero.puntosDia}` : companero.puntosDia} hoy</span>
      </div>
    </div>
  );
}
