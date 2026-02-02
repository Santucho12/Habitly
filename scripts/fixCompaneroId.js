// Habitly/scripts/fixCompaneroId.js
// Script para corregir el campo companeroId en los usuarios existentes en Firestore

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Cargar credenciales del archivo JSON
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Inicializar Firebase Admin con la clave descargada y databaseURL
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://gym-app-329cf-default-rtdb.firebaseio.com'
});

const db = getFirestore();

async function fixCompaneroId() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    // Eliminar campo 'compañeroId' (con tilde) si existe
    if (Object.prototype.hasOwnProperty.call(data, 'compañeroId')) {
      await doc.ref.update({ 'compañeroId': admin.firestore.FieldValue.delete() });
      updated++;
      console.log(`Usuario ${doc.id}: campo 'compañeroId' eliminado.`);
    }
    // Si tiene companionId pero no companeroId, lo copiamos
    if (data.companionId && !data.companeroId) {
      await doc.ref.update({ companeroId: data.companionId });
      updated++;
      console.log(`Usuario ${doc.id} actualizado: companeroId = ${data.companionId}`);
    }
  }
  console.log(`Usuarios actualizados o limpiados: ${updated}`);
}

fixCompaneroId().catch((err) => {
  console.error('Error corrigiendo companeroId:', err);
  process.exit(1);
});
