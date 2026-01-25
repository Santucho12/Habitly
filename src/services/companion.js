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
  if (userSnap.exists() && userSnap.data().companeroId) {
    throw new Error('Ya tienes un compañero asignado.');
  }
  if (companionSnap.exists() && companionSnap.data().companeroId) {
    throw new Error('El usuario ya tiene compañero.');
  }
  // Actualiza ambos perfiles con el id del compañero
  await updateDoc(userRef, { companeroId: companionId });
  await updateDoc(companionRef, { companeroId: userId });
}

// Verifica si el usuario ya tiene compañero
export async function hasCompanion(userId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return !!userSnap.data().companeroId;
  }
  return false;
}

// Devuelve los datos del compañero de un usuario
export async function getCompanionData(userId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const companeroId = userSnap.data().companeroId;
    if (companeroId) {
      const companeroRef = doc(db, 'users', companeroId);
      const companeroSnap = await getDoc(companeroRef);
      if (companeroSnap.exists()) {
        return { id: companeroSnap.id, ...companeroSnap.data() };
      }
    }
  }
  return null;
}
