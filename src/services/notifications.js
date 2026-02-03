import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

// Registra el Service Worker y solicita permiso de notificaciones push
export async function setupPushNotifications(user) {
	if (!('serviceWorker' in navigator)) return;
	try {
		const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
		// Solicita permiso
		const permission = await Notification.requestPermission();
		if (permission !== 'granted') return;
		// Obtiene el token
		const token = await getToken(messaging, {
			vapidKey: 'BFRXYfkksgqIN6XQwJFn5UJLCIj-CiNSQMPw0riYvMgR-eVq_3Mt7affZrYLFg0dFsqpfjCGR9l3UO894vNxYQU',
			serviceWorkerRegistration: registration,
		});
		// Guarda el token en Firestore bajo el usuario
		if (user && token) {
			await setDoc(doc(db, 'users', user.uid), { fcmToken: token }, { merge: true });
		}
		// Escucha mensajes en primer plano
		onMessage(messaging, payload => {
			// Puedes mostrar una notificación personalizada aquí si quieres
			console.log('Notificación recibida en primer plano:', payload);
		});
		return token;
	} catch (err) {
		console.error('Error al registrar notificaciones push:', err);
	}
}
