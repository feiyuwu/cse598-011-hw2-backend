const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

const filePath = path.join(__dirname, 'data.json');

// Ensure data.json exists
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '[]');
}

// Endpoint to receive and store page content
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

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
