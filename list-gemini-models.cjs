// Script para listar los modelos disponibles en la API de Gemini (Google AI)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAqQHBMGHWJVwiE_reUmElK1DJ6i9Bf3Ik';

async function listGeminiModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Modelos disponibles en Gemini:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error al consultar modelos de Gemini:', err);
  }
}

listGeminiModels();