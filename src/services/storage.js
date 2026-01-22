// Subir foto de perfil de usuario a Firebase Storage
export async function uploadProfilePhoto(userId, file) {
  const storageRef = ref(storage, `profile/${userId}/avatar`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
// Servicio para subir fotos de comidas a Firebase Storage
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadMealPhoto(userId, fecha, mealKey, file) {
  const storageRef = ref(storage, `meals/${userId}/${fecha}/${mealKey}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
