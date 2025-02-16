const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Allow all origins or specify frontend domain
app.use(bodyParser.json());

const filePath = path.join(__dirname, 'data.json');

// Ensure the file exists with an empty array if not present
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '[]');
}

// ✅ POST route to save new data (Appending instead of overwriting)
app.post('/save', (req, res) => {
  const { key, content } = req.body;

  if (!key || !content) {
    return res.status(400).json({ message: 'Key and content are required' });
  }

  try {
    // Step 1: Read the existing data
    let existingData = [];
    if (fs.existsSync(filePath)) {
      existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    // Step 2: Append the new entry
    existingData.push({ key, content });

    // Step 3: Write updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    res.json({ message: 'Data saved successfully!', key });
  } catch (error) {
    console.error('Error writing data:', error);
    res.status(500).json({ message: 'Error saving data' });
  }
});

// ✅ GET route to fetch all stored data (Optional)
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

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
