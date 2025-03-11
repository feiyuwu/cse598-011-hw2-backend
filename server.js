import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Allow all origins or specify frontend domain
app.use(express.json());

// 🔹 SET UP OPENAI API CLIENT
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

// ✅ AI EVALUATION ENDPOINT
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

// 🔹 FILE STORAGE FOR SAVING DATA
const filePath = path.join(process.cwd(), 'data.json');

// Ensure the file exists with an empty array if not present
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '[]');
}

// ✅ SAVE USER DATA ENDPOINT
app.post('/save', (req, res) => {
  const { key, content } = req.body;

  if (!key || !content) {
    return res.status(400).json({ message: 'Key and content are required' });
  }

  try {
    let existingData = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
      : [];

    existingData.push({ key, content });

    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    res.json({ message: 'Data saved successfully!', key });
  } catch (error) {
    console.error('Error writing data:', error);
    res.status(500).json({ message: 'Error saving data' });
  }
});

// ✅ FETCH ALL STORED DATA ENDPOINT
app.get('/data', (req, res) => {
  try {
    const data = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
      : [];
    res.json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

// ✅ ENABLE CORS FOR FRONTEND
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all domains
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// 🔹 START THE SERVER
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
