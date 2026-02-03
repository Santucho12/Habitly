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
  
    // Enviar notificaciones push con FCM API v1 usando la clave de servicio
    const { google } = require('googleapis');
  
    // Cargar la clave de servicio desde variable de entorno
    const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT_JSON);
  
    const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];
  
    async function sendPushNotification(token, title, body) {
      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: SCOPES,
      });
      const client = await auth.getClient();
      const projectId = serviceAccount.project_id;
  
      // Mensaje FCM API v1
      const message = {
        message: {
          token,
          notification: {
            title,
            body,
          },
        },
      };
  
      // Llamada a FCM API v1
      const res = await client.request({
        url: `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        method: 'POST',
        data: message,
      });
      return res.data;
    }
  
    // Ejemplo de uso (puedes adaptar a tu endpoint):
    // exports.handler = async (req, res) => {
    //   const { token, title, body } = req.body;
    //   try {
    //     const result = await sendPushNotification(token, title, body);
    //     res.status(200).json(result);
    //   } catch (err) {
    //     res.status(500).json({ error: err.message });
    //   }
    // };
}
