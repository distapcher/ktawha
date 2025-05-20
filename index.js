const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cron = require('./cron');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

const dataPath = path.join(__dirname, 'data.json');

function readData() {
  if (!fs.existsSync(dataPath)) return { wallets: [], history: [] };
  return JSON.parse(fs.readFileSync(dataPath));
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

app.post('/api/wallets', (req, res) => {
  const wallets = req.body.wallets || [];
  const data = readData();
  data.wallets = wallets;
  writeData(data);
  res.json({ success: true });
});

app.get('/api/data', (req, res) => {
  const data = readData();
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  cron();
});