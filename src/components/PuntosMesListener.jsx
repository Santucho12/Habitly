import { useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getMonthlyHabits, getMonthlyMeals, getMonthlyProgressPoints, getMonthlyLogros } from '../utils/puntosMes';
import dayjs from 'dayjs';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';

// Recalcula y guarda puntosMes en localStorage y actualiza puntosHistoricos en Firestore
async function savePuntosMesToLocal(uid) {
  const mes = dayjs().format('YYYY-MM');
  const comidas = await getMonthlyMeals(uid, mes);
  const habitos = await getMonthlyHabits(uid, mes);
  const progreso = await getMonthlyProgressPoints(uid, mes);
  const logros = await getMonthlyLogros(uid, mes);
  const puntosMes = comidas + habitos + progreso + logros;
  const data = { mes, puntosMes, desglose: { comidas, habitos, progreso, logros } };
  localStorage.setItem('puntosMes', JSON.stringify(data));
  // Actualizar puntosHistoricos en Firestore
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  let puntosHistoricos = {};
  if (userSnap.exists()) {
    puntosHistoricos = userSnap.data().puntosHistoricos || {};
  }
  puntosHistoricos[mes] = puntosMes;
  await updateDoc(userRef, { puntosHistoricos });
  console.log('[Habitly][Global] Puntos recalculados y guardados en localStorage y Firestore:', data);
}

export default function PuntosMesListener() {
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const mes = dayjs().format('YYYY-MM');
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
  }, []);
  return null;
}
