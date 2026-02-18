import { getAllUsers } from './users';
import { getWeeklyMealPoints } from './weeklyMealStats';

// Procesa todas las semanas de todos los usuarios, sumando puntos antes de borrar meals
export async function finalizeAllWeeksBeforeDelete() {
  const users = await getAllUsers();
  for (const user of users) {
    // Buscar todas las semanas del mes actual y anteriores
    // Suponemos que weekStartDate es el lunes de cada semana
    // Buscar meals existentes para el usuario
    // Obtiene todas las semanas con meals para el usuario
    const { getWeeksWithMeals } = require('./meals');
    const semanas = await getWeeksWithMeals(user.uid);
    for (const weekStartDate of semanas) {
      // Evitar duplicados en historial
      const historial = await getWeeklyMealPoints(user.uid);
      if (!historial.some(h => h.weekKey === weekStartDate)) {
        await finalizeWeeklyMeals(user.uid, weekStartDate);
      }
    }
  }
}
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
