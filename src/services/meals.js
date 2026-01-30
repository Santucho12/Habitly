import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// Sube una foto de comida a Firebase Storage y devuelve la URL
export async function uploadMealPhoto(userId, fecha, mealKey, file) {
	const storageRef = ref(storage, `meals/${userId}/${fecha}_${mealKey}_${file.name}`);
	await uploadBytes(storageRef, file);
	const url = await getDownloadURL(storageRef);
	return url;
}

import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { calcularYActualizarRanking } from '../utils/calcularRanking';
import dayjs from 'dayjs';

// Modelo de comidas diarias
// { userId, fecha, desayuno: {foto, puntuacion}, almuerzo: {...}, merienda: {...}, cena: {...}, excepcion, bonoPerfecto }

export async function saveDailyMeals(userId, fecha, data) {
	// Limpia todos los campos undefined en data y sus subcampos
	function deepClean(obj) {
		if (Array.isArray(obj)) {
			return obj.map(deepClean);
		} else if (obj && typeof obj === 'object') {
			return Object.entries(obj)
				.filter(([_, v]) => v !== undefined)
				.reduce((acc, [k, v]) => {
					acc[k] = deepClean(v);
					return acc;
				}, {});
		}
		return obj;
	}
	const cleanData = deepClean({ userId, fecha, ...data });
	const ref = doc(db, 'meals', `${userId}_${fecha}`);
	await setDoc(ref, cleanData, { merge: true });
	// Actualiza ranking automáticamente
	const mes = dayjs(fecha).format('YYYY-MM');
	await calcularYActualizarRanking(mes);
}

export async function getDailyMeals(userId, fecha) {
	const ref = doc(db, 'meals', `${userId}_${fecha}`);
	const snap = await getDoc(ref);
	return snap.exists() ? snap.data() : null;
}

export async function updateDailyMealField(userId, fecha, field, value) {
	const ref = doc(db, 'meals', `${userId}_${fecha}`);
		await updateDoc(ref, { [field]: value });
		// Actualiza ranking automáticamente
		const mes = dayjs(fecha).format('YYYY-MM');
		await calcularYActualizarRanking(mes);
}

// Validar si ya hay excepción en la semana (para 5.5)
export async function hasExceptionThisWeek(userId, weekKey) {
	// weekKey: '2026-01-3' (año-mes-semana)
	// Buscar meals de la semana y ver si alguna tiene excepcion=true
	// (esto requiere query, se implementa en el componente)
}

// Obtiene la última comida registrada de la semana actual

export async function getLastMeal(userId) {
	const today = dayjs();
	for (let i = 0; i < 7; i++) {
		const fecha = today.subtract(i, 'day').format('YYYY-MM-DD');
		const data = await getDailyMeals(userId, fecha);
		if (data) {
			// Buscar la última comida registrada
			const comidas = ['cena', 'merienda', 'almuerzo', 'desayuno'];
			for (const tipo of comidas) {
				if (data[tipo]) {
					return { tipo, ...data[tipo], fecha };
				}
			}
		}
	}
	return null;
}
