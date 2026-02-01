import React, { useState, useEffect } from 'react';
import { useUserNames } from '../../hooks/useUserNames';
import { FaArrowDown } from 'react-icons/fa';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import dayjs from 'dayjs';
import { getMonthlyRanking } from '../../services/ranking';

export default function ProgresoComparativo({ usuarioId, companeroId }) {
  const { myName, companionName } = useUserNames();
  const [myProgress, setMyProgress] = useState(null);
  const [companionProgress, setCompanionProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myTotalAcumulado, setMyTotalAcumulado] = useState(null);
  const [companionTotalAcumulado, setCompanionTotalAcumulado] = useState(null);
  const [myPuntosMes, setMyPuntosMes] = useState(0);
  const [companionPuntosMes, setCompanionPuntosMes] = useState(0);
  const mesActual = dayjs().format('YYYY-MM');

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      // Busca con el formato userId_mes
      const mySnap = await getDoc(doc(db, 'progress', `${usuarioId}_${mesActual}`));
      setMyProgress(mySnap.exists() ? mySnap.data() : null);
      const compSnap = await getDoc(doc(db, 'progress', `${companeroId}_${mesActual}`));
      setCompanionProgress(compSnap.exists() ? compSnap.data() : null);

      // Calcular total acumulado para usuario
      const myQuery = query(collection(db, 'progress'), where('userId', '==', usuarioId));
      const myDocs = await getDocs(myQuery);
      let minPeso = null;
      let maxPeso = null;
      myDocs.forEach(docu => {
        const data = docu.data();
        if (data.peso !== undefined && data.peso !== null && data.mes) {
          if (minPeso === null || data.mes < minPeso.mes) minPeso = { mes: data.mes, peso: data.peso };
          if (maxPeso === null || data.mes > maxPeso.mes) maxPeso = { mes: data.mes, peso: data.peso };
        }
      });
      if (minPeso && maxPeso) {
        setMyTotalAcumulado(maxPeso.peso - minPeso.peso);
      } else {
        setMyTotalAcumulado(null);
      }

      // Calcular total acumulado para compañero
      const compQuery = query(collection(db, 'progress'), where('userId', '==', companeroId));
      const compDocs = await getDocs(compQuery);
      let minPesoC = null;
      let maxPesoC = null;
      compDocs.forEach(docu => {
        const data = docu.data();
        if (data.peso !== undefined && data.peso !== null && data.mes) {
          if (minPesoC === null || data.mes < minPesoC.mes) minPesoC = { mes: data.mes, peso: data.peso };
          if (maxPesoC === null || data.mes > maxPesoC.mes) maxPesoC = { mes: data.mes, peso: data.peso };
        }
      });
      if (minPesoC && maxPesoC) {
        setCompanionTotalAcumulado(maxPesoC.peso - minPesoC.peso);
      } else {
        setCompanionTotalAcumulado(null);
      }
      // Obtener puntos totales del mes (comidas + hábitos + progreso + logros)
      const ranking = await getMonthlyRanking(mesActual);
      if (ranking && ranking.usuarios) {
        const user = ranking.usuarios.find(u => u.userId === usuarioId);
        const compa = ranking.usuarios.find(u => u.userId === companeroId);
        setMyPuntosMes(user?.puntos ?? 0);
        setCompanionPuntosMes(compa?.puntos ?? 0);
      }

      setLoading(false);
    }
    if (usuarioId && companeroId) fetchProgress();
  }, [usuarioId, companeroId, mesActual]);

  if (loading) return <div>Cargando progreso...</div>;

  return (
    <div className="flex items-center justify-center gap-8 mt-8">
      {/* Card Usuario */}
      <div className="rounded-3xl border-4 border-blue-900 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 shadow-2xl p-6 flex flex-col items-center justify-center text-white w-64" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)', transform: 'scale(0.6)', transformOrigin: 'top left', marginTop: '-120px' }}>
        <div className="mb-3 text-4xl drop-shadow-lg" style={{fontSize: '2.2rem'}}>📊</div>
        <div className="font-extrabold text-2xl mb-2 tracking-wide uppercase drop-shadow">{myName}</div>
        <div className="mb-3">
          
        </div>
        <div className="mb-3">
          <span className="text-base font-semibold text-cyan-100">Peso actual:</span><br />
          <span className="flex justify-center items-center">
            {myProgress && myProgress.peso !== undefined && myProgress.peso !== null ? (
              <>
                <span className="font-bold text-2xl text-white drop-shadow">{myProgress.peso}</span>
                <span className="text-base ml-2">kg</span>
              </>
            ) : (
              <span className="text-gray-400">Sin datos</span>
            )}
          </span>
        </div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-semibold text-cyan-100">Kilos bajados:</span>
          <FaArrowDown className="text-cyan-200 text-lg" />
          {typeof myTotalAcumulado === 'number' ? (
            <>
              <span className="font-bold text-lg text-white drop-shadow">{Math.abs(myTotalAcumulado)}</span> <span className="text-xs">kg</span>
            </>
          ) : (
            <span className="text-gray-400">Sin datos</span>
          )}
        </div>
        {/* Fecha eliminada, no se muestra */}
      </div>
      {/* Card Compañero */}
      <div className="rounded-3xl border-4 border-pink-900 bg-gradient-to-br from-gray-900 via-pink-900 to-gray-800 shadow-2xl p-6 flex flex-col items-center justify-center text-white w-64" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)', transform: 'scale(0.6)', transformOrigin: 'top left', marginTop: '-120px', marginLeft: '-86px' }}>
        <div className="mb-3 text-4xl drop-shadow-lg" style={{fontSize: '2.2rem'}}>📊</div>
        <div className="font-extrabold text-2xl mb-2 tracking-wide uppercase drop-shadow">{companionName}</div>
        <div className="mb-3">
          
        </div>
        <div className="mb-3">
          <span className="text-base font-semibold text-pink-100">Peso actual:</span><br />
          <span className="flex justify-center items-center">
            {companionProgress && companionProgress.peso !== undefined && companionProgress.peso !== null ? (
              <>
                <span className="font-bold text-2xl text-white drop-shadow">{companionProgress.peso}</span>
                <span className="text-base ml-2">kg</span>
              </>
            ) : (
              <span className="text-gray-400">Sin datos</span>
            )}
          </span>
        </div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-semibold text-pink-100">Kilos bajados:</span>
          <FaArrowDown className="text-pink-200 text-lg" />
          {typeof companionTotalAcumulado === 'number' ? (
            <>
              <span className="font-bold text-lg text-white drop-shadow">{Math.abs(companionTotalAcumulado)}</span> <span className="text-xs">kg</span>
            </>
          ) : (
            <span className="text-gray-400">Sin datos</span>
          )}
        </div>
        {/* Fecha eliminada, no se muestra */}
      </div>
    </div>
  );
}

