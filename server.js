// server.js

const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config();
const axios = require('axios');
const path = require('path');

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '/')));

// Endpoint to handle AI feedback requests
app.post('/api/ai-feedback', async (req, res) => {
  const prompt = req.body.prompt;

  if (!prompt) {
    return res.status(400).send('Prompt is required.');
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
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

    const feedback = response.data.choices[0].message.content.trim();
    res.json({ feedback });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send('Error communicating with OpenAI API');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
