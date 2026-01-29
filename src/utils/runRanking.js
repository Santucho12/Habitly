// Este archivo permite ejecutar el cálculo y actualización del ranking mensual real desde la consola
// Úsalo solo para pruebas o como admin

import { calcularYActualizarRanking } from './calcularRanking';
import dayjs from 'dayjs';

async function main() {
  const mes = dayjs().format('YYYY-MM');
  console.log('Calculando ranking real para el mes:', mes);
  const ranking = await calcularYActualizarRanking(mes);
  console.log('Ranking actualizado:', ranking);
}

main().catch(console.error);
