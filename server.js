import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Fix: Allow CORS for all origins (Update this to your frontend URL for security)
const allowedOrigins = [
  'http://localhost:3000', // Local Testing
  'https://feiyuwu.github.io/cse598-011-hw3/', // Replace with actual frontend URL
  'http://127.0.0.1:3000/index.html', // Add any other frontend domain
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// ✅ Fix: Explicitly Handle OPTIONS Preflight Requests
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res.sendStatus(204); // Return No Content for OPTIONS request
});

// ✅ AI EVALUATION ENDPOINT (OpenAI Integration)
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

app.post('/api/evaluate-selection', async (req, res) => {
  try {
    const { image, confidence, aiReasons, realReasons } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required.' });
    }

    const aiResponse = await openai.createChatCompletion({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an AI that evaluates image selections.',
        },
        {
          role: 'user',
          content: `Evaluate the correctness of the following image classification:\n
          - Image: ${image}
          - Confidence Level: ${confidence}%
          - AI Indicators: ${
            aiReasons.length > 0 ? aiReasons.join(', ') : 'None'
          }
          - Real Photo Indicators: ${
            realReasons.length > 0 ? realReasons.join(', ') : 'None'
          }
          
          Provide a response indicating if the selection is correct and why.`,
        },
      ],
    });

    res.json({ evaluation: aiResponse.data.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get AI evaluation.' });
  }
});

// ✅ Fix: Allow CORS Headers for Every Request
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// ✅ Catch-All Route for Debugging
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint Not Found' });
});

// ✅ START THE SERVER
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
