import React, { useEffect, useState } from 'react';
import { useUserNames } from '../hooks/useUserNames';
import { useFechaActual } from '../context/FechaContext';
import EmptyState from '../components/EmptyState';
import { getMonthlyRanking } from '../services/ranking';
import { getMonthlyHabits, getMonthlyMeals, getMonthlyProgressPoints, getMonthlyLogros } from '../utils/puntosMes';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// Importar dayjs para fechas

// Importar savePuntosMesToLocal desde Meals (o definir aquí si es necesario)
async function savePuntosMesToLocal(uid) {
  const mes = dayjs().format('YYYY-MM');
  const [year, month] = mes.split('-').map(Number);
  // No override, solo cálculo global
  const comidas = await getMonthlyMeals(uid, mes);
  const habitos = await getMonthlyHabits(uid, mes);
  const progreso = await getMonthlyProgressPoints(uid, mes);
  const logros = await getMonthlyLogros(uid, mes);
  const puntosMes = comidas + habitos + progreso + logros;
  const data = { mes, puntosMes, desglose: { comidas, habitos, progreso, logros } };
  localStorage.setItem('puntosMes', JSON.stringify(data));
  // Log para debug
  console.log('[Habitly][Stats] Puntos recalculados y guardados en localStorage:', data);
}
import { getAllUsers } from '../services/users';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function StatsPage() {
  const { myName, companionName } = useUserNames();
  const { fechaActual } = useFechaActual();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prevPos, setPrevPos] = useState(null);
  const [puntosTotales, setPuntosTotales] = useState({ yo: 0, compa: 0 });
  const [user, setUser] = useState(null);
  const mes = fechaActual.format('YYYY-MM');
  // Leer puntos y desglose de localStorage si existen
  const getLocalPuntos = () => {
    try {
      const data = JSON.parse(localStorage.getItem('puntosMes'));
      if (data && data.mes === mes) return data;
    } catch {}
    return null;
  };
  const [localPuntos, setLocalPuntos] = useState(getLocalPuntos());

  // Escuchar cambios en localStorage y foco de ventana para recargar puntos
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'puntosMes') {
        setLocalPuntos(getLocalPuntos());
      }
    };
    const handleFocus = () => {
      setLocalPuntos(getLocalPuntos());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [mes]);


  useEffect(() => {
    // Get current user from Firebase Auth
    const auth = getAuth();
    setUser(auth.currentUser);
  }, []);


    // Escuchar cambios en meals, habits, progress y logros del usuario y recalcular puntosMes
    useEffect(() => {
      if (!user) return;
      const mes = dayjs().format('YYYY-MM');
      // Fechas del mes actual
      const [year, month] = mes.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      const fechas = Array.from({ length: daysInMonth }, (_, i) => dayjs(`${mes}-01`).add(i, 'day').format('YYYY-MM-DD'));

      // Meals
      const mealsUnsubs = fechas.map(fecha =>
        onSnapshot(
          doc(db, 'meals', `${user.uid}_${fecha}`),
          () => savePuntosMesToLocal(user.uid)
        )
      );
      // Habits
      const habitsUnsubs = fechas.map(fecha =>
        onSnapshot(
          doc(db, 'habits', `${user.uid}_${fecha}`),
          () => savePuntosMesToLocal(user.uid)
        )
      );
      // Progress
      const progressUnsub = onSnapshot(
        doc(db, 'progress', `${user.uid}_${mes}`),
        () => savePuntosMesToLocal(user.uid)
      );
      // Logros
      const logrosUnsub = onSnapshot(
        query(collection(db, 'logros'), where('userId', '==', user.uid)),
        () => savePuntosMesToLocal(user.uid)
      );

      return () => {
        mealsUnsubs.forEach(unsub => unsub && unsub());
        habitsUnsubs.forEach(unsub => unsub && unsub());
        if (progressUnsub) progressUnsub();
        if (logrosUnsub) logrosUnsub();
      };
    }, [user]);

  useEffect(() => {
    if (!user) return;
    async function fetchPuntosMes() {
      // Leer ranking mensual para ambos usuarios
      const rankingData = await getMonthlyRanking(mes);
      if (rankingData && rankingData.usuarios) {
        const yo = rankingData.usuarios.find(u => u.userId === user.uid);
        const compaId = yo?.companeroId || (await getDoc(doc(db, 'users', user.uid))).data()?.companeroId;
        const compa = rankingData.usuarios.find(u => u.userId === compaId);
        setPuntosTotales({
          yo: yo?.puntos ?? 0,
          compa: compa?.puntos ?? 0
        });
      }
    }
    fetchPuntosMes();
  }, [user, mes]);

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
    async function fetchDesgloseMes() {
      if (!user) return;
      // Si hay desglose en localStorage, usarlo para el usuario
      let desgloseYo = localPuntos?.desglose || { habitos: 0, comidas: 0, progreso: 0, logros: 0 };
      // Leer desgloseMes de Firestore para compañero
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      let desgloseCompa = { habitos: 0, comidas: 0 };
      let compaId = null;
      if (userSnap.exists()) {
        compaId = userSnap.data().companeroId;
      }
      if (compaId) {
        const compaRef = doc(db, 'users', compaId);
        const compaSnap = await getDoc(compaRef);
        if (compaSnap.exists()) {
          desgloseCompa = compaSnap.data().desgloseMes || { habitos: 0, comidas: 0 };
        }
      }
      setDesglose({
        yo: { ...desgloseYo },
        compa: { ...desgloseCompa }
      });
    }
    fetchDesgloseMes();
  }, [mes, user]);

  // Logros y rachas (simulado)
  const logrosYo = yo?.logros || ['Top 1', 'Racha 3 meses'];
  const logrosCompa = compa?.logros || ['Top 2'];
  const rachaYo = yo?.racha || 3;
  const rachaCompa = compa?.racha || 1;

  // Ranking histórico real de puntos
  const [historial, setHistorial] = useState([]);
  useEffect(() => {
    async function fetchHistorial() {
      if (!user) return;
      // Leer puntosHistoricos de Firestore para usuario y compañero
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      let puntosHistoricosYo = {};
      let puntosHistoricosCompa = {};
      let compaId = null;
      if (userSnap.exists()) {
        puntosHistoricosYo = userSnap.data().puntosHistoricos || {};
        compaId = userSnap.data().companeroId;
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
              <td className="py-2 px-2">{myName}</td>
              <td className="py-2 px-2">{yo.puntos}</td>
              <td className="py-2 px-2 text-2xl">{medalla(yo.posicion)}</td>
            </tr>
          )}
          {compa && (
            <tr className="bg-green-900 text-green-300 font-bold animate-fade-in">
              <td className="py-2 px-2">{compa.posicion}</td>
              <td className="py-2 px-2">{companionName}</td>
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
            <span className="font-semibold text-blue-200 text-lg mb-2">{myName}</span>
            <span className="text-4xl font-bold text-white drop-shadow">{historial.length > 0 ? historial[historial.length-1].yo : 0}</span>
          </div>
          <div className="bg-gradient-to-br from-green-700 to-green-900 shadow-lg rounded-2xl px-2 py-2 sm:px-6 sm:py-5 flex flex-col items-center w-full max-w-[400px]">
            <span className="font-semibold text-green-200 text-lg mb-2">{companionName}</span>
            <span className="text-4xl font-bold text-white drop-shadow">{historial.length > 0 ? historial[historial.length-1].compa : 0}</span>
          </div>
        </div>
      </div>

      {/* 3. Desglose de puntos (estética mejorada) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-blue-400 mb-4 tracking-wide text-center">Desglose de puntos</h3>
          <div className="flex flex-row gap-1 sm:gap-4 justify-center w-full">
            <div className="bg-gradient-to-br from-blue-600 to-blue-900 shadow-lg rounded-2xl px-2 py-2 sm:px-6 sm:py-5 flex flex-col items-center w-full max-w-[400px]">
            <span className="font-semibold text-blue-200 text-lg mb-2">{myName}</span>
            <ul className="text-white text-base font-medium space-y-1">
              <li>Hábitos: <span className="font-bold text-blue-300">{desglose.yo.habitos}</span></li>
              <li>Comidas: <span className="font-bold text-blue-300">{desglose.yo.comidas}</span></li>
              <li>Rachas: <span className="font-bold text-blue-300">{desglose.yo.progreso}</span></li>
            </ul>
          </div>
            <div className="bg-gradient-to-br from-green-600 to-green-900 shadow-lg rounded-2xl px-2 py-2 sm:px-6 sm:py-5 flex flex-col items-center w-full max-w-[400px]">
            <span className="font-semibold text-green-200 text-lg mb-2">{companionName}</span>
            <ul className="text-white text-base font-medium space-y-1">
              <li>Hábitos: <span className="font-bold text-green-300">{desglose.compa.habitos}</span></li>
              <li>Comidas: <span className="font-bold text-green-300">{desglose.compa.comidas}</span></li>
              <li>Rachas: <span className="font-bold text-green-300">{desglose.compa.progreso}</span></li>
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
                <th className="py-3 px-4">Tus puntos</th>
                <th className="py-3 px-4">Puntos de {companionName}</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h,i)=>(
                <tr key={i} className="border-b border-gray-700 last:border-none hover:bg-gray-800 transition">
                  <td className="py-3 px-4 font-medium text-white">{dayjs(h.mes).locale('es').format('MMMM YYYY')}</td>
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