// scripts/autoFinalizeMeals.js
const { finalizeAllWeeksBeforeDelete } = require('../src/services/finalizeWeeklyMeals');

async function main() {
  try {
    await finalizeAllWeeksBeforeDelete();
    console.log('Puntos semanales guardados correctamente para todos los usuarios.');
  } catch (err) {
    console.error('Error al guardar puntos semanales:', err);
  }
}

main();
