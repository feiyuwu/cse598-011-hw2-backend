const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow frontend domain for CORS
app.use(cors({ origin: 'https://cse598-011-hw2.onrender.com' }));

app.use(bodyParser.json());

const filePath = path.join(__dirname, 'data.json');

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '[]');
}

app.post('/save', (req, res) => {
  const { key, content } = req.body;

  if (!key || !content) {
    return res.status(400).json({ message: 'Key and content are required' });
  }

  let existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  existingData.push({ key, content });

  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

  res.json({ message: 'Data saved successfully!', key });
});

app.get('/data', (req, res) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://cse598-011-hw2.onrender.com'
  ); // ✅ Fix missing CORS header

  const filePath = 'data.json';
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json({ content: data.length ? data[data.length - 1].content : '' });
  } else {
    res.json({ content: '' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
