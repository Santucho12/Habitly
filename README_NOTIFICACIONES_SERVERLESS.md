# Notificaciones Push Serverless con Vercel para Habitly

Guía paso a paso para implementar notificaciones push (eventos de hábitos y recordatorio mensual) usando funciones serverless gratuitas en Vercel.

---

## 1. Requisitos previos
- App Habitly funcionando como PWA (con FCM configurado y tokens guardados en Firestore)
- Cuenta gratuita en Vercel (https://vercel.com/)
- Clave de servidor FCM (Server Key) desde la consola de Firebase

---

## 2. Crear función serverless en Vercel
1. En tu proyecto Habitly, crea la carpeta `api` en la raíz (si no existe).
2. Crea el archivo `api/sendPush.js` con este contenido:

```js
// api/sendPush.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { token, title, body } = req.body;
  if (!token || !title || !body) return res.status(400).json({ error: 'Faltan datos' });

  // Tu clave de servidor FCM (Server Key)
  const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

  const payload = {
    notification: { title, body },
    to: token,
  };

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `key=${FCM_SERVER_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  res.status(200).json(data);
}
```

3. En Vercel, configura la variable de entorno `FCM_SERVER_KEY` con tu clave de servidor de Firebase Cloud Messaging.
   - Ve a Firebase > Project Settings > Cloud Messaging > Server Key.
   - Copia la clave y agrégala en Vercel (Settings > Environment Variables).

---

## 3. Enviar notificaciones desde el frontend
Cuando tu compañero marca un hábito como cumplido:
1. Obtén el token FCM del compañero desde Firestore.
2. Haz una petición POST a tu endpoint serverless:

```js
await fetch('https://tu-proyecto-vercel.vercel.app/api/sendPush', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: tokenCompanero,
    title: '¡Tu compañero fue al gimnasio!',
    body: '¿Te animás a ir también hoy?',
  })
});
```

Puedes adaptar el mensaje y el evento para cualquier hábito.

---

## 4. Recordatorio mensual (opcional)
- Para enviar el recordatorio mensual, puedes usar un servicio externo gratuito como [EasyCron](https://www.easycron.com/) o [GitHub Actions] para hacer una petición POST a tu endpoint Vercel el primer día de cada mes.
- El payload sería igual, solo cambia el token y el mensaje.

---

## 5. Compatibilidad y recomendaciones
- Funciona en Android y iPhone (iOS 16.4+) si la PWA está instalada y el usuario dio permiso.
- Asegúrate de guardar y actualizar los tokens FCM en Firestore.
- Protege tu endpoint con autenticación si lo necesitas (opcional).

---

## 6. Recursos útiles
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions/introduction)
- [Firebase Cloud Messaging REST API](https://firebase.google.com/docs/cloud-messaging/send-message)
- [EasyCron](https://www.easycron.com/)

---

¿Dudas? ¡Consulta y sigue los pasos! Puedes pedirme ayuda en cada etapa.