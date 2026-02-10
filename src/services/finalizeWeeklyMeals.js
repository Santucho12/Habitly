import { getDailyMeals } from './meals';
import { saveWeeklyMealPoints } from './weeklyMealStats';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import dayjs from 'dayjs';
import { calcularPuntosDia } from '../utils/points';

// Borra todas las comidas de una semana y guarda los puntos totales usando la lógica real de puntos
export async function finalizeWeeklyMeals(userId, weekStartDate) {
  let totalPoints = 0;
  for (let i = 0; i < 7; i++) {
    const fecha = dayjs(weekStartDate).add(i, 'day').format('YYYY-MM-DD');
    const data = await getDailyMeals(userId, fecha);
    if (data) {
      // Calcular puntos del día usando la lógica real
      const comidas = ['desayuno', 'almuerzo', 'merienda', 'cena'].map(key => data[key] || {});
      totalPoints += calcularPuntosDia({
        gym: false,
        correr: false,
        caminar: false,
        comidas,
        bonoPerfecto: data.bonoPerfecto,
        rachaGimnasio: 0,
        excepcion: data.excepcion
      });
      // Borra el documento de comidas del día
      await deleteDoc(doc(db, 'meals', `${userId}_${fecha}`));
    }
  }
  // Guarda los puntos totales de la semana
  await saveWeeklyMealPoints(userId, weekStartDate, totalPoints);
  return totalPoints;
}
