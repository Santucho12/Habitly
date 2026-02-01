// scripts/deleteOldMealPhotos.js
// Script para borrar fotos de meals en Cloudinary que tengan más de X días

const cloudinary = require('cloudinary').v2;
const DAY_LIMIT = 14; // Cambia a 7 para una semana, 14 para dos semanas

// Configura tus credenciales de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function deleteOldMealPhotos() {
  const now = Date.now();
  let deleted = 0;
  // Buscar solo imágenes de meals (por tag o carpeta)
  // Si usas carpeta: 'meals/'
  // Si usas tag: 'meal'
  const resources = await cloudinary.search
    .expression('folder:meals') // Cambia a 'tags:meal' si usas tags
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

deleteOldMealPhotos().catch(console.error);
