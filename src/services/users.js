import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

// Devuelve todos los usuarios registrados en la colección 'users'
export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}
