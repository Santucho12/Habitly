// Servicio para vincular/desvincular usuarios y actualizar sus campos
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { createPair, breakPair } from './pairs';

// Vincular dos usuarios
export async function linkUsers(userAId, userBId) {
  const pairId = await createPair(userAId, userBId);
  await Promise.all([
    updateDoc(doc(db, 'users', userAId), {
      pairId,
      companeroId: userBId // campo correcto
    }),
    updateDoc(doc(db, 'users', userBId), {
      pairId,
      companeroId: userAId // campo correcto
    })
  ]);
  return pairId;
}

// Desvincular usuarios
export async function unlinkUsers(userAId, userBId, reason = null) {
  // Obtener el pairId actual
  // (asume que ambos tienen el mismo pairId)
  const userDoc = doc(db, 'users', userAId);
  const userSnap = await getDoc(userDoc);
  const pairId = userSnap.data().pairId;
  if (!pairId) throw new Error('No hay pareja vinculada');
  await breakPair(pairId, reason);
  await Promise.all([
    updateDoc(doc(db, 'users', userAId), {
      pairId: null,
      companionId: null
    }),
    updateDoc(doc(db, 'users', userBId), {
      pairId: null,
      companionId: null
    })
  ]);
}
