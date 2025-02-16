const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow frontend domain for CORS
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
  fs.writeFileSync(filePath, '[]'); // Use an array to store multiple records
}

// ✅ Fetch all stored key-content pairs
app.get('/data', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (existingData.length > 0) {
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

  const entry = existingData.find((item) => item.key === requestedKey);
  if (entry) {
    res.json(entry);
  } else {
    res.status(404).json({ message: 'No data found for this key' });
  }
});

// ✅ Append new key-content pairs and save the updated data
app.post('/save', (req, res) => {
  const newData = req.body; // Expecting an array

  if (!Array.isArray(newData)) {
    return res
      .status(400)
      .json({ message: 'Invalid data format. Expected an array.' });
  }

  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));

  res.json({ message: 'Data updated successfully!' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
