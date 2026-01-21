import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// weekKey: '2026-01-3' (año-mes-semana)
export async function hasExceptionThisWeek(userId, weekKey) {
  // Buscar meals de la semana y ver si alguna tiene excepcion=true
  const q = query(
    collection(db, 'meals'),
    where('userId', '==', userId),
    where('fecha', ">=", weekKey + '-1'),
    where('fecha', "<=", weekKey + '-7')
  );
  const snap = await getDocs(q);
  return snap.docs.some(doc => doc.data().excepcion === true);
}
