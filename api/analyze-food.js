// Vercel Serverless Function: /api/analyze-food.js
// Recibe una imagen (base64 o URL), la envía a Google Cloud Vision API y devuelve la clasificación

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Missing Gemini API key' });
  }

  try {
    // Gemini espera imágenes en base64 sin el prefijo data:image/xxx;base64,
    const base64Clean = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [
        {
          parts: [
            { inline_data: { mime_type: 'image/jpeg', data: base64Clean } },
            { text: 'Clasifica la comida y asigna una puntuación: Muy bien, Bien, Regular, Mal, Muy mal. Devuelve también una etiqueta y una breve explicación.' }
          ]
        }
      ]
    };
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    // Procesar respuesta Gemini
    let score = 'Regular';
    let etiqueta = '';
    let explicacion = '';
    if (result && result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
      const text = result.candidates[0].content.parts[0].text || '';
      // Extraer datos del texto (puedes mejorar el parsing según el formato de Gemini)
      if (/muy bien/i.test(text)) score = 'Muy bien';
      else if (/bien/i.test(text)) score = 'Bien';
      else if (/regular/i.test(text)) score = 'Regular';
      else if (/mal/i.test(text)) score = 'Mal';
      else if (/muy mal/i.test(text)) score = 'Muy mal';
      // Etiqueta y explicación (puedes ajustar el parsing)
      etiqueta = (text.match(/Etiqueta: (.*)/i) || [])[1] || '';
      explicacion = text;
    }
    res.status(200).json({ result, score, etiqueta, explicacion });
  } catch (err) {
    res.status(500).json({ error: 'Gemini API error', details: err.message });
  }
}
