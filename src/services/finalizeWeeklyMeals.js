import { getDailyMeals } from './meals';
import { saveWeeklyMealPoints } from './weeklyMealStats';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import dayjs from 'dayjs';

// Borra todas las comidas de una semana y guarda los puntos totales
export async function finalizeWeeklyMeals(userId, weekStartDate) {
  let totalPoints = 0;
  const comidas = ['desayuno', 'almuerzo', 'merienda', 'cena'];
  for (let i = 0; i < 7; i++) {
    const fecha = dayjs(weekStartDate).add(i, 'day').format('YYYY-MM-DD');
    const data = await getDailyMeals(userId, fecha);
    if (data) {
      for (const tipo of comidas) {
        if (data[tipo] && data[tipo].puntuacion) {
          totalPoints += Number(data[tipo].puntuacion) || 0;
        }
      }
      // Borra el documento de comidas del día
      await deleteDoc(doc(db, 'meals', `${userId}_${fecha}`));
    }
  }
  // Guarda los puntos totales de la semana
  await saveWeeklyMealPoints(userId, weekStartDate, totalPoints);
  return totalPoints;
}
