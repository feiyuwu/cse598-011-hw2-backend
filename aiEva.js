import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const app = express();
app.use(cors()); // Allow all origins
app.use(express.json());

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

app.post('/api/evaluate-selection', async (req, res) => {
  const { image, confidence, aiReasons, realReasons } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image is required.' });
  }

  try {
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
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get AI evaluation.' });
  }
});

// Allow CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all domains
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
