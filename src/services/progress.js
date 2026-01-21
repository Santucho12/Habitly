import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Modelo: { userId, mes: 'YYYY-MM', foto, peso }
export async function saveMonthlyProgress(userId, mes, data) {
	const ref = doc(db, 'progress', `${userId}_${mes}`);
	await setDoc(ref, { userId, mes, ...data }, { merge: true });
}

export async function getMonthlyProgress(userId, mes) {
	const ref = doc(db, 'progress', `${userId}_${mes}`);
	const snap = await getDoc(ref);
	return snap.exists() ? snap.data() : null;
}
