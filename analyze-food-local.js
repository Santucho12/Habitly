const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/analyze-food', async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'Missing imageBase64' });

  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) return res.status(500).json({ error: 'Missing Hugging Face token' });

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/akhaliq/nutrify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: imageBase64 })
    });
    const result = await response.json();
    let score = 'Safa';
    if (Array.isArray(result)) {
      const labels = result.map(r => r.label.toLowerCase());
      if (labels.some(l => ['salad', 'vegetable', 'fruit', 'chicken', 'fish', 'healthy'].includes(l))) score = 'Bien';
      if (labels.some(l => ['cake', 'burger', 'pizza', 'fries', 'dessert', 'soda', 'fast food'].includes(l))) score = 'Mal';
    }
    res.status(200).json({ result, score });
  } catch (err) {
    res.status(500).json({ error: 'Hugging Face API error', details: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`API local corriendo en http://localhost:${PORT}/api/analyze-food`));
