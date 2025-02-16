const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Ensure correct CORS settings
const allowedOrigin = 'https://feiyuwu.github.io'; // No trailing slash

app.use(
  cors({
    origin: allowedOrigin,
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type',
  })
);

app.use(bodyParser.json());

const filePath = path.join(__dirname, 'data.json');

// ✅ Ensure `data.json` exists
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '{}'); // Use an object to store key-value pairs
}

// ✅ Fetch all stored key-content pairs
app.get('/data', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (Object.keys(existingData).length > 0) {
    res.json(existingData);
  } else {
    res.status(404).json({ message: 'No data found' });
  }
});

// ✅ Fetch stored content by key
app.get('/data/:key', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const requestedKey = req.params.key;
  const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (existingData[requestedKey]) {
    res.json({ key: requestedKey, content: existingData[requestedKey] });
  } else {
    res.status(404).json({ message: 'No data found for this key' });
  }
});

// ✅ Store key-content pairs
app.post('/save', (req, res) => {
  const { key, content } = req.body;

  if (!key || !content) {
    return res.status(400).json({ message: 'Key and content are required' });
  }

  let existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  existingData[key] = content;

  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

  res.json({ message: 'Data saved successfully!', key });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
