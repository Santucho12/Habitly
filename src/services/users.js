import { doc, getDoc } from 'firebase/firestore';

// Devuelve las estadísticas individuales del usuario
export async function getUserStats(uid) {
  const statsDoc = doc(db, 'stats', uid);
  const snap = await getDoc(statsDoc);
  return snap.exists() ? snap.data() : null;
}
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

// Devuelve todos los usuarios registrados en la colección 'users'
export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}
