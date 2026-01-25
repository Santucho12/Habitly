
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Guarda el check diario de actividades físicas
export async function saveDailyActivity(userId, date, data) {
	const ref = doc(db, 'habits', `${userId}_${date}`);
	await setDoc(ref, { userId, date, ...data }, { merge: true });
}

// Obtiene el check diario de actividades físicas
export async function getDailyActivity(userId, date) {
	const ref = doc(db, 'habits', `${userId}_${date}`);
	const snap = await getDoc(ref);
	if (snap.exists()) return snap.data();
	return null;
}

// Devuelve los datos básicos del usuario (nombre, avatar, etc)
export async function getUserData(userId) {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}
