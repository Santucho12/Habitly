// Script para corregir el campo companeroId en los usuarios
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

// UIDs de los usuarios
const santiId = 'aR3xYjxiGdeVcDmYPqZdEvJQkEh1';
const eduId = 'iHF4K2X6j2YptA7kATQZMWmcoK12';

async function fixCompaneroId() {
  // Santi: companeroId debe ser Edu
  await updateDoc(doc(db, 'users', santiId), {
    companeroId: eduId
  });
  // Edu: companeroId debe ser Santi
  await updateDoc(doc(db, 'users', eduId), {
    companeroId: santiId
  });
  console.log('Campos companeroId actualizados correctamente.');
}

fixCompaneroId();
