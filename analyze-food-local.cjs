const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/analyze-food', async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'Missing imageBase64' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAqQHBMGHWJVwiE_reUmElK1DJ6i9Bf3Ik';
  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Missing Gemini API key' });

  try {
    // Gemini espera imágenes en base64 sin el prefijo data:image/xxx;base64,
    const base64Clean = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `¿Qué comida aparece en la imagen?\nLínea 1: responde solo con el nombre del plato o alimento principal.\nLínea 2: responde solo con una palabra la categoría para una persona que quiere bajar de peso: Muy bien, Bien, Regular, Mal o Muy mal.\nLínea 3: Escribe el título "Explicación:" y luego explica en no más de 2 o 3 líneas por qué le diste esa puntuación, mencionando ingredientes, método de cocción o acompañamientos que influyeron en la decisión. No repitas el nombre de la comida ni la categoría en la explicación.\nLínea 4: Escribe el título "Tips para mejorar:" y luego da 2 o 3 tips concretos para mejorar la comida y hacerla más saludable para alguien que quiere bajar de peso. No repitas el título.\nSi no puedes identificar la comida, responde "Desconocido" y en la segunda línea "Regular".`
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Clean
              }
            }
          ]
        }
      ]
    };
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt)
    });
    const result = await response.json();
    console.log('Resultado Gemini:', JSON.stringify(result, null, 2));
    let etiqueta = 'Desconocido';
    let score = 'Regular';
    if (result && result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
      const text = result.candidates[0].content.parts.map(p => p.text).join('\n').trim();
      const [linea1, linea2] = text.split(/\r?\n/);
      if (linea1) etiqueta = linea1.trim();
      if (linea2) {
        const l2 = linea2.toLowerCase();
        if (l2.includes('muy bien')) score = 'Muy bien';
        else if (l2 === 'bien') score = 'Bien';
        else if (l2 === 'regular') score = 'Regular';
        else if (l2 === 'mal') score = 'Mal';
        else if (l2.includes('muy mal')) score = 'Muy mal';
      }
    }
    res.status(200).json({ result, etiqueta, score });
  } catch (err) {
    console.error('Error en analyze-food-local:', err);
    res.status(500).json({ error: 'Gemini API error', details: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`API local corriendo en http://localhost:${PORT}/api/analyze-food`));
