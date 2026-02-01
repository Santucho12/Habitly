// src/services/companion.js
// Servicio para emparejamiento de compañeros
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Genera el código de invitación (puede ser el UID del usuario)
export function generateCompanionCode(user) {
  return user.uid;
}

// Busca usuario por código (UID)
export async function findUserByCode(code) {
  const userRef = doc(db, 'users', code);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
}

// Empareja dos usuarios cruzando las referencias
export async function pairUsers(userId, companionId) {
  const userRef = doc(db, 'users', userId);
  const companionRef = doc(db, 'users', companionId);
  // Validación estricta: si alguno ya tiene compañero, no permitir
  const userSnap = await getDoc(userRef);
  const companionSnap = await getDoc(companionRef);
  if (userSnap.exists() && userSnap.data().companionId) {
    throw new Error('Ya tienes un compañero asignado.');
  }
  if (companionSnap.exists() && companionSnap.data().companionId) {
    throw new Error('El usuario ya tiene compañero.');
  }
  // Actualiza ambos perfiles con el id del compañero
  await updateDoc(userRef, { companionId: companionId });
  await updateDoc(companionRef, { companionId: userId });
}

// Verifica si el usuario ya tiene compañero
export async function hasCompanion(userId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return !!userSnap.data().companionId;
  }
  return false;
}

// Devuelve los datos del compañero de un usuario
export async function getCompanionData(userId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const companionId = userSnap.data().companionId;
    if (companionId) {
      const companionRef = doc(db, 'users', companionId);
      const companionSnap = await getDoc(companionRef);
      if (companionSnap.exists()) {
        return { id: companionSnap.id, ...companionSnap.data() };
      }
    }
  }
  return null;
}
