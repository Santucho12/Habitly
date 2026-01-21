
// Calcula la nueva racha dado el estado anterior y si se cumplió hoy
export function actualizarRacha(rachaActual, cumplioHoy, excepcion = false) {
	if (excepcion) return rachaActual; // No corta racha
	if (cumplioHoy) return rachaActual + 1;
	return 0;
}
