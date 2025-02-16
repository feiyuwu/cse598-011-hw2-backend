const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Serve data.json dynamically
app.get('/data', (req, res) => {
  const filePath = path.join(__dirname, 'data.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data.json:', err);
      return res.status(500).json({ error: 'Failed to read data.json' });
    }
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
