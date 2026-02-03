
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { calcularYActualizarRanking } from '../utils/calcularRanking';
import dayjs from 'dayjs';

// Guarda el check diario de actividades físicas
export async function saveDailyActivity(userId, date, data) {
	// date debe ser YYYY-MM-DD local
	console.log('[saveDailyActivity] userId:', userId, 'date:', date, 'data:', data);
	const ref = doc(db, 'habits', `${userId}_${date}`);
	await setDoc(ref, { userId, date, ...data }, { merge: true });
	// Actualiza ranking automáticamente
	const mes = dayjs(date).format('YYYY-MM');
	await calcularYActualizarRanking(mes);
	console.log('[saveDailyActivity] Guardado en Firestore:', `${userId}_${date}`);
}

// Obtiene el check diario de actividades físicas
export async function getDailyActivity(userId, date) {
	console.log('[getDailyActivity] userId:', userId, 'date:', date);
	const ref = doc(db, 'habits', `${userId}_${date}`);
	const snap = await getDoc(ref);
	if (snap.exists()) {
		const data = snap.data();
		console.log('[getDailyActivity] Datos encontrados:', data);
		return data;
	}
	console.log('[getDailyActivity] No se encontró documento para:', `${userId}_${date}`);
	return null;
}

// Devuelve los datos básicos del usuario (nombre, avatar, etc)
export async function getUserData(userId) {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}
