// server.js

const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config();
const axios = require('axios');
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, '/'))); // Serve static files

app.post('/api/ai-feedback', async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini-2024-07-18', // Use 'gpt-4' if you have access
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    res.json({ feedback: response.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send('Error communicating with OpenAI API');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
