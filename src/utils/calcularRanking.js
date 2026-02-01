// Script para calcular y actualizar el ranking mensual real de todos los usuarios
// Ejecuta esto desde un admin panel o función especial (no desde el frontend normal)


import { getAllUsers } from '../services/users'; // Debes tener una función que devuelva todos los usuarios
import { saveMonthlyRanking } from '../services/ranking';
import { getMonthlyHabits, getMonthlyMeals, getMonthlyProgressPoints, getMonthlyLogros } from './puntosMes';
import { getDailyActivity } from '../services/habits';
import { getDailyMeals } from '../services/meals';
import { calcularPuntosDia } from './points';
import dayjs from 'dayjs';

function sumarPuntos(desglose) {
  return (
    (desglose.habitos || 0) +
    (desglose.comidas || 0) +
    (desglose.progreso || 0) +
    (desglose.logros || 0)
  );
}

export async function calcularYActualizarRanking(mes) {
  const usuarios = await getAllUsers();
  const ranking = [];
  const hoy = dayjs().format('YYYY-MM-DD');
  for (const user of usuarios) {
    // Usar funciones reales de puntos
    const habitos = await getMonthlyHabits(user.uid, mes);
    const comidas = await getMonthlyMeals(user.uid, mes);
    const progreso = await getMonthlyProgressPoints(user.uid, mes);
    const logros = await getMonthlyLogros(user.uid, mes);
    const desglose = { habitos, comidas, progreso, logros };
    const puntos = sumarPuntos(desglose);

    // Calcular puntos del día actual
    let puntosDia = 0;
    // Habitos del día
    const dataHabitos = await getDailyActivity(user.uid, hoy);
    if (dataHabitos) {
      puntosDia += calcularPuntosDia({
        gym: dataHabitos.gym,
        correr: dataHabitos.correr,
        caminar: dataHabitos.caminar,
        comidas: [],
        bonoPerfecto: false,
        rachaGimnasio: 0,
        excepcion: false
      });
    }
    // Comidas del día
    const dataComidas = await getDailyMeals(user.uid, hoy);
    if (dataComidas) {
      const comidasArr = ['desayuno','almuerzo','merienda','cena'].map(key => dataComidas[key] || {});
      puntosDia += calcularPuntosDia({
        gym: false,
        correr: false,
        caminar: false,
        comidas: comidasArr,
        bonoPerfecto: false,
        rachaGimnasio: 0,
        excepcion: false
      });
    }

    ranking.push({
      userId: user.uid,
      nombre: user.nombre,
      puntos,
      puntosDia,
      desglose,
    });
  }
  ranking.sort((a, b) => b.puntos - a.puntos);
  ranking.forEach((u, i) => (u.posicion = i + 1));
  await saveMonthlyRanking(mes, ranking);
  return ranking;
}

// Uso:
// await calcularYActualizarRanking('2026-01');
