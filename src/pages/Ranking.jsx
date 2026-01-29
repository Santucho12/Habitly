import React, { useEffect, useState, useRef } from 'react';
import EmptyState from '../components/EmptyState';
import { getMonthlyRanking } from '../services/ranking';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';

function Ranking() {


  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prevPos, setPrevPos] = useState(null);
  const user = getAuth().currentUser;
  const mes = dayjs().format('YYYY-MM');
  const animRowRef = useRef(null);

  useEffect(() => {
    getMonthlyRanking(mes).then(data => {
      const usuarios = data?.usuarios || [];
      const myUser = usuarios.find(u => u.userId === user?.uid);
      if (myUser && prevPos !== null && myUser.posicion < prevPos) {
        // Subió de posición
        if (animRowRef.current) {
          animRowRef.current.classList.add('animate-ranking-up');
          setTimeout(() => {
            if (animRowRef.current) animRowRef.current.classList.remove('animate-ranking-up');
          }, 1200);
        }
      }
      setPrevPos(myUser?.posicion || null);
      setRanking(usuarios);
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [mes]);

  // Ranking mensual con medallas
  const yo = ranking.find(u => u.userId === user?.uid);
  const compa = ranking.find(u => u.userId !== user?.uid);
  const medalla = (pos) => pos === 1 ? '🥇' : pos === 2 ? '🥈' : '';

  // Evolución de posiciones (simulada)
  const evolucion = yo?.evolucion || [2,2,1,1]; // ejemplo
  const compaEvolucion = compa?.evolucion || [1,1,2,2];

  // Desglose de puntos (siempre reales, nunca simulados)
  const desgloseYo = yo?.desglose || { habitos: 0, comidas: 0, progreso: 0, logros: 0 };
  const desgloseCompa = compa?.desglose || { habitos: 0, comidas: 0, progreso: 0, logros: 0 };

  // Logros y rachas (simulado)
  const logrosYo = yo?.logros || ['Top 1', 'Racha 3 meses'];
  const logrosCompa = compa?.logros || ['Top 2'];
  const rachaYo = yo?.racha || 3;
  const rachaCompa = compa?.racha || 1;

  // Ranking histórico (solo muestra el mes actual con datos reales)
  const historial = [
    { mes: mes, yo: yo?.puntos ?? '-', compa: compa?.puntos ?? '-' }
  ];

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-blue-300 mb-4 text-center">Ranking mensual</h2>
      {/* 1. Tabla de posiciones con medallas */}
      <table className="w-full text-left bg-gray-900 rounded-xl overflow-hidden mb-6">
        <thead>
          <tr className="bg-gray-700">
            <th className="py-2 px-2">Posición</th>
            <th className="py-2 px-2">Usuario</th>
            <th className="py-2 px-2">Puntos</th>
            <th className="py-2 px-2">Medalla</th>
          </tr>
        </thead>
        <tbody>
          {yo && (
            <tr className="bg-blue-900 text-blue-300 font-bold animate-fade-in">
              <td className="py-2 px-2">{yo.posicion}</td>
              <td className="py-2 px-2">Tú</td>
                <td className="py-2 px-2">{yo?.puntos ?? 0}</td>
              <td className="py-2 px-2 text-2xl">{medalla(yo.posicion)}</td>
            </tr>
          )}
          {compa && (
            <tr className="bg-green-900 text-green-300 font-bold animate-fade-in">
              <td className="py-2 px-2">{compa.posicion}</td>
              <td className="py-2 px-2">Compañero</td>
                <td className="py-2 px-2">{compa?.puntos ?? 0}</td>
              <td className="py-2 px-2 text-2xl">{medalla(compa.posicion)}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 2. Puntos totales del mes (estética mejorada) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-blue-400 mb-4 tracking-wide text-center">Puntos totales del mes</h3>
        <div className="flex gap-6 justify-center">
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 shadow-lg rounded-2xl px-6 py-5 flex flex-col items-center w-44">
            <span className="font-semibold text-blue-200 text-lg mb-2">Tú</span>
            <span className="text-4xl font-bold text-white drop-shadow">{yo?.puntos ?? 0}</span>
          </div>
          <div className="bg-gradient-to-br from-green-700 to-green-900 shadow-lg rounded-2xl px-6 py-5 flex flex-col items-center w-44">
            <span className="font-semibold text-green-200 text-lg mb-2">Compañero</span>
            <span className="text-4xl font-bold text-white drop-shadow">{compa?.puntos ?? 0}</span>
          </div>
        </div>
      </div>

      {/* 3. Desglose de puntos (estética mejorada) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-blue-400 mb-4 tracking-wide text-center">Desglose de puntos</h3>
        <div className="flex gap-6 justify-center">
          <div className="bg-gradient-to-br from-blue-600 to-blue-900 shadow-lg rounded-2xl px-6 py-5 flex flex-col items-center w-44">
            <span className="font-semibold text-blue-200 text-lg mb-2">Tú</span>
            <ul className="text-white text-base font-medium space-y-1">
              <li>Hábitos: <span className="font-bold text-blue-300">{desgloseYo.habitos}</span></li>
              <li>Comidas: <span className="font-bold text-blue-300">{desgloseYo.comidas}</span></li>
              <li>Progreso: <span className="font-bold text-blue-300">{desgloseYo.progreso}</span></li>
              <li>Logros: <span className="font-bold text-blue-300">{desgloseYo.logros}</span></li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-900 shadow-lg rounded-2xl px-6 py-5 flex flex-col items-center w-44">
            <span className="font-semibold text-green-200 text-lg mb-2">Compañero</span>
            <ul className="text-white text-base font-medium space-y-1">
              <li>Hábitos: <span className="font-bold text-green-300">{desgloseCompa.habitos}</span></li>
              <li>Comidas: <span className="font-bold text-green-300">{desgloseCompa.comidas}</span></li>
              <li>Progreso: <span className="font-bold text-green-300">{desgloseCompa.progreso}</span></li>
              <li>Logros: <span className="font-bold text-green-300">{desgloseCompa.logros}</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* ...se elimina la sección de comparación directa... */}

      {/* ...se elimina la sección de logros y badges... */}

      {/* ...se elimina la sección de rachas y estadísticas... */}

      {/* 7. Ranking histórico (estética mejorada) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-blue-400 mb-4 tracking-wide text-center">Ranking histórico</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-gray-700 text-blue-200 text-base">
                <th className="py-3 px-4">Mes</th>
                <th className="py-3 px-4">Puntos Tú</th>
                <th className="py-3 px-4">Puntos Compañero</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h,i)=>(
                <tr key={i} className="border-b border-gray-700 last:border-none hover:bg-gray-800 transition">
                  <td className="py-3 px-4 font-medium text-white">{dayjs(h.mes).format('MMMM YYYY')}</td>
                  <td className="py-3 px-4 font-bold text-blue-300">{h.yo}</td>
                  <td className="py-3 px-4 font-bold text-green-300">{h.compa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Animaciones y efectos */}
      {yo && prevPos !== null && yo.posicion < prevPos && (
        <div className="text-green-400 text-center font-bold animate-bounce mb-4">¡Subiste de posición!</div>
      )}
      {yo && prevPos !== null && yo.posicion > prevPos && (
        <div className="text-red-400 text-center font-bold animate-pulse mb-4">¡Bajaste de posición!</div>
      )}
    </div>
  );
}

export default Ranking;
