// Servicio para guardar puntos semanales de comida
import { db } from './firebase';
import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';

// Guarda el total de puntos de comida de una semana para un usuario
export async function saveWeeklyMealPoints(userId, weekKey, points) {
  const col = collection(db, 'weeklyMealStats');
  await addDoc(col, {
    userId,
    weekKey, // formato: '2026-01-05' (lunes de la semana)
    points,
    createdAt: Timestamp.now(),
  });
}

export async function getWeeklyMealPoints(userId, mes) {
  // mes: 'YYYY-MM' para filtrar solo semanas de ese mes
  const col = collection(db, 'weeklyMealStats');
  let q = query(col, where('userId', '==', userId));
  const snap = await getDocs(q);
  // Filtrar por mes si se pasa
  let docs = snap.docs.map(doc => doc.data());
  if (mes) {
    docs = docs.filter(d => d.weekKey && d.weekKey.startsWith(mes));
  }
  return docs;
}
