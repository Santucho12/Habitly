// Script para calcular y actualizar el ranking mensual real de todos los usuarios
// Ejecuta esto desde un admin panel o función especial (no desde el frontend normal)


import { getAllUsers } from '../services/users'; // Debes tener una función que devuelva todos los usuarios
import { saveMonthlyRanking } from '../services/ranking';
import { getMonthlyHabits, getMonthlyMeals, getMonthlyProgressPoints, getMonthlyLogros } from './puntosMes';

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
  for (const user of usuarios) {
    // Usar funciones reales de puntos
    const habitos = await getMonthlyHabits(user.uid, mes);
    const comidas = await getMonthlyMeals(user.uid, mes);
    const progreso = await getMonthlyProgressPoints(user.uid, mes);
    const logros = await getMonthlyLogros(user.uid, mes);
    const desglose = { habitos, comidas, progreso, logros };
    const puntos = sumarPuntos(desglose);
    ranking.push({
      userId: user.uid,
      nombre: user.nombre,
      puntos,
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
