import { db } from './firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { calcularYActualizarRanking } from '../utils/calcularRanking';
import dayjs from 'dayjs';

// Devuelve todos los logros de un usuario
export async function getUserLogros(uid) {
  const q = query(collection(db, 'logros'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data());
}

// Agrega un logro a un usuario y actualiza el ranking automáticamente
export async function addUserLogro(userId, logro) {
  // logro debe tener al menos: { nombre, puntos, fecha }
  await addDoc(collection(db, 'logros'), { userId, ...logro });
  // Actualiza ranking automáticamente
  const mes = dayjs(logro.fecha).format('YYYY-MM');
  await calcularYActualizarRanking(mes);
}
