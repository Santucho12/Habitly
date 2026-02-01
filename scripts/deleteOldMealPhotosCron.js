// scripts/deleteOldMealPhotosCron.js
// Script para borrar fotos de meals en Cloudinary cada 14 días automáticamente
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const cron = require('node-cron');
const DAY_LIMIT = 14;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function deleteOldMealPhotos() {
  const now = Date.now();
  let deleted = 0;
  const resources = await cloudinary.search
    .expression('folder:meals')
    .max_results(500)
    .execute();

  for (const img of resources.resources) {
    const created = new Date(img.created_at).getTime();
    const ageDays = (now - created) / (1000 * 60 * 60 * 24);
    if (ageDays > DAY_LIMIT) {
      await cloudinary.uploader.destroy(img.public_id);
      deleted++;
      console.log(`Borrada: ${img.public_id} (${Math.round(ageDays)} días)`);
    }
  }
  console.log(`Total borradas: ${deleted}`);
}

// Ejecutar cada 14 días (a las 3:00 AM)
cron.schedule('0 3 */14 * *', () => {
  console.log('Ejecutando limpieza automática de fotos de meals...');
  deleteOldMealPhotos().catch(console.error);
});

// Ejecutar una vez al iniciar para debug/manual
if (process.env.RUN_ON_START === 'true') {
  deleteOldMealPhotos().catch(console.error);
}
