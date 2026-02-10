// Funciones para obtener los puntos reales de cada usuario en el mes actual
import { getDailyMeals } from '../services/meals';
import { getWeeklyMealPoints } from '../services/weeklyMealStats';
import { getMonthlyProgress } from '../services/progress';
import { getDailyActivity } from '../services/habits';
import { getUserLogros } from '../services/logros';
import dayjs from 'dayjs';
// Importar lógica real de puntos
import { calcularPuntosDia } from './points';

// Devuelve un array con todas las fechas del mes en formato YYYY-MM-DD
function getAllDatesOfMonth(mes) {
  const [year, month] = mes.split('-').map(Number);
  const firstDay = dayjs(`${year}-${month}-01`);
  const daysInMonth = firstDay.daysInMonth();
  return Array.from({ length: daysInMonth }, (_, i) => firstDay.add(i, 'day').format('YYYY-MM-DD'));
}

// Suma puntos de hábitos del mes
export async function getMonthlyHabits(uid, mes) {
  let total = 0;
  const fechas = getAllDatesOfMonth(mes);
  for (const fecha of fechas) {
    const data = await getDailyActivity(uid, fecha);
    // Sumar puntos de actividades físicas según lógica real
    if (data) {
      total += calcularPuntosDia({
        gym: data.gym,
        correr: data.correr,
        caminar: data.caminar,
        comidas: [], // No suma comidas aquí
        bonoPerfecto: false,
        rachaGimnasio: 0,
        excepcion: false
      });
    }
  }
  return total;
}

// Suma puntos de comidas del mes
// Permite override de un día y comidas para feedback inmediato
export async function getMonthlyMeals(uid, mes, overrideDay, overrideMeals) {
  // 1. Sumar puntos de historial semanal guardado
  let total = 0;
  const historialSemanal = await getWeeklyMealPoints(uid, mes);
  if (historialSemanal && historialSemanal.length > 0) {
    total += historialSemanal.reduce((acc, s) => acc + (s.points || 0), 0);
  }
  // 2. Sumar puntos de los días de la semana actual (no guardados aún)
  const fechas = getAllDatesOfMonth(mes);
  // Filtrar días que no están en historial semanal (semana actual)
  // Suponemos que weekKey es el lunes de cada semana: 'YYYY-MM-DD'
  // Obtenemos las fechas de la semana actual
  // const dayjs = require('dayjs'); // Removed: use ES import at top
  const today = dayjs();
  const semanaActual = fechas.filter(f => {
    // Si la fecha es de la semana actual (según today)
    return dayjs(f).isSame(today, 'week');
  });
  for (const fecha of semanaActual) {
    let data;
    if (overrideDay && overrideMeals && fecha === overrideDay) {
      data = overrideMeals;
    } else {
      data = await getDailyMeals(uid, fecha);
    }
    if (data) {
      const comidas = ['desayuno','almuerzo','merienda','cena'].map(key => data[key] || {});
      total += calcularPuntosDia({
        gym: false,
        correr: false,
        caminar: false,
        comidas,
        bonoPerfecto: data.bonoPerfecto,
        rachaGimnasio: 0,
        excepcion: data.excepcion
      });
    }
  }
  return total;
}

// Suma puntos de progreso del mes
export async function getMonthlyProgressPoints(uid, mes) {
  // Asume que getMonthlyProgress devuelve un array de registros con campo 'puntos' o 'peso'
  const progresos = await getMonthlyProgress(uid, mes);
  if (!progresos) return 0;
  // Si es un array de progresos, suma los puntos
  if (Array.isArray(progresos)) {
    return progresos.reduce((acc, p) => acc + (p.puntos || 0), 0);
  }
  // Si es un solo objeto, retorna puntos o 0
  return progresos.puntos || 0;
}

// Suma puntos de logros del mes
export async function getMonthlyLogros(uid, mes) {
  // Asume que getUserLogros devuelve un array de logros con campo 'puntos' y 'fecha'
  const logros = await getUserLogros(uid);
  if (!logros) return 0;
  return logros.filter(l => l.fecha && l.fecha.startsWith(mes)).reduce((acc, l) => acc + (l.puntos || 0), 0);
}
