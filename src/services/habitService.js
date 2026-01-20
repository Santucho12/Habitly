// Servicio para CRUD de hábitos en Firestore
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { habitCollection } from '../models/habitModel';

// Crear hábito
export async function addHabit(habit) {
  const col = collection(db, habitCollection);
  const docRef = await addDoc(col, habit);
  return docRef.id;
}

// Leer hábitos de un usuario
export async function getHabitsByUser(uid) {
  const col = collection(db, habitCollection);
  const q = query(col, where('owner', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Actualizar hábito
export async function updateHabit(id, data) {
  const ref = doc(db, habitCollection, id);
  await updateDoc(ref, data);
}

// Eliminar hábito
export async function deleteHabit(id) {
  const ref = doc(db, habitCollection, id);
  await deleteDoc(ref);
}