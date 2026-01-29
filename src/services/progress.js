import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { calcularYActualizarRanking } from '../utils/calcularRanking';
import dayjs from 'dayjs';

// Modelo: { userId, mes: 'YYYY-MM', foto, peso }
export async function saveMonthlyProgress(userId, mes, data) {
	const ref = doc(db, 'progress', `${userId}_${mes}`);
	await setDoc(ref, { userId, mes, ...data }, { merge: true });
	// Actualiza ranking automáticamente
	await calcularYActualizarRanking(mes);
}

export async function getMonthlyProgress(userId, mes) {
	const ref = doc(db, 'progress', `${userId}_${mes}`);
	const snap = await getDoc(ref);
	return snap.exists() ? snap.data() : null;
}

// Obtiene el peso actual y el anterior del usuario

export async function getLastTwoWeights(userId) {
	const mesActual = dayjs().format('YYYY-MM');
	const mesAnterior = dayjs().subtract(1, 'month').format('YYYY-MM');
	const actual = await getMonthlyProgress(userId, mesActual);
	const anterior = await getMonthlyProgress(userId, mesAnterior);
	return {
		actual: actual?.peso || null,
		anterior: anterior?.peso || null,
	};
}
