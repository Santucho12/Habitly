// Servicio para guardar puntos semanales de comida
import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

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

// Obtiene el historial de puntos semanales de comida de un usuario
export async function getWeeklyMealPoints(userId) {
  // ...se puede implementar según necesidad
}
