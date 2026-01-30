// Lógica de cálculo de puntos y rachas
// Actividades: gimnasio (10), correr (15), caminar (8)
// Comidas: desayuno, almuerzo, merienda, cena (0,3,5)
// Bonos: comidas perfectas x1.5, gimnasio 2 semanas x1.5
// Excepción: no corta racha ni resta puntos

export function calcularPuntosDia({ gym, correr, caminar, comidas, bonoPerfecto, rachaGimnasio, excepcion }) {
	let puntos = 0;
	if (gym) puntos += 10;
	if (correr) puntos += 15;
	if (caminar) puntos += 8;
	if (comidas && comidas.length > 0) {
		// Sumar puntos de todas las comidas cargadas (aunque falten)
		puntos += comidas.reduce((acc, c) => acc + (c?.puntuacion || 0), 0);
		// Si las 4 comidas existen y todas son 5, aplicar bono perfecto
		if (comidas.length === 4 && comidas.every(c => c?.puntuacion === 5)) puntos *= 1.5;
	}
	if (rachaGimnasio >= 14) puntos *= 1.5;
	if (excepcion) {
		// No cortar racha ni restar puntos
	}
	return Math.round(puntos);
}

export function calcularRacha(dias, excepciones=[]) {
	// dias: array de bool (cumplido o no)
	// excepciones: array de índices de días permitidos
	let maxRacha = 0, actual = 0;
	for (let i = 0; i < dias.length; i++) {
		if (dias[i] || excepciones.includes(i)) {
			actual++;
			if (actual > maxRacha) maxRacha = actual;
		} else {
			actual = 0;
		}
	}
	return maxRacha;
}

// Calcula los puntos del día según actividades marcadas y bonificaciones
