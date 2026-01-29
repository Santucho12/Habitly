import React, { useEffect, useState, useRef } from 'react';
import EmptyState from '../components/EmptyState';
import { getMonthlyRanking } from '../services/ranking';
import { getMonthlyHabits, getMonthlyMeals, getMonthlyProgressPoints, getMonthlyLogros } from '../utils/puntosMes';
import { getAllUsers } from '../services/users';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';

export default function StatsPage() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prevPos, setPrevPos] = useState(null);
  const [puntosTotales, setPuntosTotales] = useState({ yo: 0, compa: 0 });
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

    // Calcular suma real de puntos para el usuario y su compañero
    async function calcularPuntos() {
      if (!user) return;
      // Suma para el usuario actual
      const [habitos, comidas, progreso, logros] = await Promise.all([
        getMonthlyHabits(user.uid, mes),
        getMonthlyMeals(user.uid, mes),
        getMonthlyProgressPoints(user.uid, mes),
        getMonthlyLogros(user.uid, mes)
      ]);
      let compaId = null;
      // Buscar el id del compañero (el primer usuario distinto al actual)
      const allUsers = await getAllUsers();
      const compaUser = allUsers.find(u => u.uid !== user.uid);
      if (compaUser) {
        compaId = compaUser.uid;
      }
      let compaHab = 0, compaCom = 0, compaProg = 0, compaLog = 0;
      if (compaId) {
        [compaHab, compaCom, compaProg, compaLog] = await Promise.all([
          getMonthlyHabits(compaId, mes),
          getMonthlyMeals(compaId, mes),
          getMonthlyProgressPoints(compaId, mes),
          getMonthlyLogros(compaId, mes)
        ]);
      }
      setPuntosTotales({
        yo: habitos + comidas + progreso + logros,
        compa: compaHab + compaCom + compaProg + compaLog
      });
    }
    calcularPuntos();
    // eslint-disable-next-line
  }, [mes, user]);

  // Ranking mensual con medallas
  const yo = ranking.find(u => u.userId === user?.uid);
  const compa = ranking.find(u => u.userId !== user?.uid);
  const medalla = (pos) => pos === 1 ? '🥇' : pos === 2 ? '🥈' : '';

  // Evolución de posiciones (simulada)
  const evolucion = yo?.evolucion || [2,2,1,1]; // ejemplo
  const compaEvolucion = compa?.evolucion || [1,1,2,2];

  // Desglose de puntos (simulado)
  const [desglose, setDesglose] = useState({ yo: { habitos: 0, comidas: 0, progreso: 0, logros: 0 }, compa: { habitos: 0, comidas: 0, progreso: 0, logros: 0 } });

  useEffect(() => {
    async function calcularDesglose() {
      if (!user) return;
      const [habitos, comidas, progreso, logros] = await Promise.all([
        getMonthlyHabits(user.uid, mes),
        getMonthlyMeals(user.uid, mes),
        getMonthlyProgressPoints(user.uid, mes),
        getMonthlyLogros(user.uid, mes)
      ]);
      let compaId = null;
      const allUsers = await getAllUsers();
      const compaUser = allUsers.find(u => u.uid !== user.uid);
      let compaHab = 0, compaCom = 0, compaProg = 0, compaLog = 0;
      if (compaUser) {
        compaId = compaUser.uid;
        [compaHab, compaCom, compaProg, compaLog] = await Promise.all([
          getMonthlyHabits(compaId, mes),
          getMonthlyMeals(compaId, mes),
          getMonthlyProgressPoints(compaId, mes),
          getMonthlyLogros(compaId, mes)
        ]);
      }
      setDesglose({
        yo: { habitos, comidas, progreso, logros },
        compa: { habitos: compaHab, comidas: compaCom, progreso: compaProg, logros: compaLog }
      });
    }
    calcularDesglose();
  }, [mes, user]);

  // Logros y rachas (simulado)
  const logrosYo = yo?.logros || ['Top 1', 'Racha 3 meses'];
  const logrosCompa = compa?.logros || ['Top 2'];
  const rachaYo = yo?.racha || 3;
  const rachaCompa = compa?.racha || 1;

  // Ranking histórico real de puntos
  const [historial, setHistorial] = useState([]);
  useEffect(() => {
    async function calcularHistorial() {
      if (!user) return;
      // Obtener los últimos 6 meses (incluyendo el actual)
      const meses = [];
      for (let i = 5; i >= 0; i--) {
        meses.push(dayjs().subtract(i, 'month').format('YYYY-MM'));
      }
      const allUsers = await getAllUsers();
      const compaUser = allUsers.find(u => u.uid !== user.uid);
      const compaId = compaUser ? compaUser.uid : null;
      const historialData = await Promise.all(meses.map(async m => {
        const [yoHab, yoCom, yoProg, yoLog] = await Promise.all([
          getMonthlyHabits(user.uid, m),
          getMonthlyMeals(user.uid, m),
          getMonthlyProgressPoints(user.uid, m),
          getMonthlyLogros(user.uid, m)
        ]);
        let compaHab = 0, compaCom = 0, compaProg = 0, compaLog = 0;
        if (compaId) {
          [compaHab, compaCom, compaProg, compaLog] = await Promise.all([
            getMonthlyHabits(compaId, m),
            getMonthlyMeals(compaId, m),
            getMonthlyProgressPoints(compaId, m),
            getMonthlyLogros(compaId, m)
          ]);
        }
        return {
          mes: m,
          yo: yoHab + yoCom + yoProg + yoLog,
          compa: compaHab + compaCom + compaProg + compaLog
        };
      }));
      setHistorial(historialData);
    }
    calcularHistorial();
  }, [user]);

  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-2 sm:p-6 mt-4 sm:mt-8">
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
              <td className="py-2 px-2">{yo.puntos}</td>
              <td className="py-2 px-2 text-2xl">{medalla(yo.posicion)}</td>
            </tr>
          )}
          {compa && (
            <tr className="bg-green-900 text-green-300 font-bold animate-fade-in">
              <td className="py-2 px-2">{compa.posicion}</td>
              <td className="py-2 px-2">Compañero</td>
              <td className="py-2 px-2">{compa.puntos}</td>
              <td className="py-2 px-2 text-2xl">{medalla(compa.posicion)}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 2. Puntos totales del mes (estética mejorada) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-blue-400 mb-4 tracking-wide text-center">Puntos totales del mes</h3>
          <div className="flex flex-row gap-1 sm:gap-4 justify-center w-full">
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 shadow-lg rounded-2xl px-2 py-2 sm:px-6 sm:py-5 flex flex-col items-center w-full max-w-[400px]">
            <span className="font-semibold text-blue-200 text-lg mb-2">Tú</span>
            <span className="text-4xl font-bold text-white drop-shadow">{puntosTotales.yo}</span>
          </div>
            <div className="bg-gradient-to-br from-green-700 to-green-900 shadow-lg rounded-2xl px-2 py-2 sm:px-6 sm:py-5 flex flex-col items-center w-full max-w-[400px]">
            <span className="font-semibold text-green-200 text-lg mb-2">Compañero</span>
            <span className="text-4xl font-bold text-white drop-shadow">{puntosTotales.compa}</span>
          </div>
        </div>
      </div>

      {/* 3. Desglose de puntos (estética mejorada) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-blue-400 mb-4 tracking-wide text-center">Desglose de puntos</h3>
          <div className="flex flex-row gap-1 sm:gap-4 justify-center w-full">
            <div className="bg-gradient-to-br from-blue-600 to-blue-900 shadow-lg rounded-2xl px-2 py-2 sm:px-6 sm:py-5 flex flex-col items-center w-full max-w-[400px]">
            <span className="font-semibold text-blue-200 text-lg mb-2">Tú</span>
            <ul className="text-white text-base font-medium space-y-1">
              <li>Hábitos: <span className="font-bold text-blue-300">{desglose.yo.habitos}</span></li>
              <li>Comidas: <span className="font-bold text-blue-300">{desglose.yo.comidas}</span></li>
              <li>Progreso: <span className="font-bold text-blue-300">{desglose.yo.progreso}</span></li>
              <li>Logros: <span className="font-bold text-blue-300">{desglose.yo.logros}</span></li>
            </ul>
          </div>
            <div className="bg-gradient-to-br from-green-600 to-green-900 shadow-lg rounded-2xl px-2 py-2 sm:px-6 sm:py-5 flex flex-col items-center w-full max-w-[400px]">
            <span className="font-semibold text-green-200 text-lg mb-2">Compañero</span>
            <ul className="text-white text-base font-medium space-y-1">
              <li>Hábitos: <span className="font-bold text-green-300">{desglose.compa.habitos}</span></li>
              <li>Comidas: <span className="font-bold text-green-300">{desglose.compa.comidas}</span></li>
              <li>Progreso: <span className="font-bold text-green-300">{desglose.compa.progreso}</span></li>
              <li>Logros: <span className="font-bold text-green-300">{desglose.compa.logros}</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 7. Ranking histórico (estética mejorada) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-blue-400 mb-4 tracking-wide text-center">Ranking histórico</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[320px] text-left bg-gray-900 rounded-xl overflow-hidden">
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
