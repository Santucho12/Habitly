import { db } from './firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Guardar ranking mensual
export async function saveMonthlyRanking(mes, usuarios) {
  // Limpia todos los campos undefined en cada usuario
  function clean(obj) {
    if (Array.isArray(obj)) {
      return obj.map(clean);
    } else if (obj && typeof obj === 'object') {
      return Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .reduce((acc, [k, v]) => {
          acc[k] = clean(v);
          return acc;
        }, {});
    }
    return obj;
  }
  const usuariosLimpios = clean(usuarios);
  const ref = doc(db, 'rankings', mes);
  await setDoc(ref, { mes, usuarios: usuariosLimpios }, { merge: true });
}

// Obtener ranking mensual
export async function getMonthlyRanking(mes) {
  const ref = doc(db, 'rankings', mes);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// Obtener ranking de todos los meses
export async function getAllRankings() {
  const q = query(collection(db, 'rankings'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data());
}
