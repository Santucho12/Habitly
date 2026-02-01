// Servicio para gestionar la colección 'pairs' en Firestore
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

// Crear una nueva pareja
export async function createPair(userAId, userBId) {
  const pairsRef = collection(db, 'pairs');
  const pairDoc = doc(pairsRef);
  await setDoc(pairDoc, {
    pairId: pairDoc.id,
    userAId,
    userBId,
    createdAt: serverTimestamp(),
    active: true,
    sharedStatsEnabled: true,
    breakReason: null
  });
  return pairDoc.id;
}

// Obtener pareja por usuario
export async function getPairByUserId(userId) {
  const pairsRef = collection(db, 'pairs');
  const q = query(pairsRef, where('active', '==', true), where('userAId', '==', userId));
  const q2 = query(pairsRef, where('active', '==', true), where('userBId', '==', userId));
  const [snapA, snapB] = await Promise.all([getDocs(q), getDocs(q2)]);
  if (!snapA.empty) return snapA.docs[0].data();
  if (!snapB.empty) return snapB.docs[0].data();
  return null;
}

// Desvincular pareja
export async function breakPair(pairId, reason = null) {
  const pairDoc = doc(db, 'pairs', pairId);
  await updateDoc(pairDoc, {
    active: false,
    breakReason: reason || null
  });
}
