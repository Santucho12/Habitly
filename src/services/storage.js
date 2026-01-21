// Servicio para subir fotos de comidas a Firebase Storage
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadMealPhoto(userId, fecha, mealKey, file) {
  const storageRef = ref(storage, `meals/${userId}/${fecha}/${mealKey}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
