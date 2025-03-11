import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors({ origin: '*' }));
app.use(express.json());

// ✅ Handle OPTIONS Preflight Requests (For CORS)
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res.sendStatus(204);
});

// ✅ OpenAI API Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ AI Image Evaluation Endpoint
app.post('/api/evaluate-selection', async (req, res) => {
  try {
    const { imageUrl, confidence, aiReasons, realReasons } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required.' });
    }

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an AI that evaluates image authenticity.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Evaluate if this image is AI-generated or real based on these indicators. Please be very short:\n
            - Confidence Level: ${confidence}%
            - AI Indicators: ${
              aiReasons.length > 0 ? aiReasons.join(', ') : 'None'
            }
            - Real Photo Indicators: ${
              realReasons.length > 0 ? realReasons.join(', ') : 'None'
            }
            \nProvide a detailed explanation.`,
            },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    res.json({ evaluation: aiResponse.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get AI evaluation.' });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
