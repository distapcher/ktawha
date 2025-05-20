const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const getKeetaBalance = require('./fetchBalances');

const dataPath = path.join(__dirname, 'data.json');

function readData() {
  if (!fs.existsSync(dataPath)) return { wallets: [], history: [] };
  return JSON.parse(fs.readFileSync(dataPath));
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

async function updateBalances() {
  const data = readData();
  const date = new Date().toISOString().split('T')[0];
  const balances = [];

  for (const wallet of data.wallets) {
    const balance = await getKeetaBalance(wallet);
    balances.push(balance);
  }

  data.history.push({ date, balances });
  writeData(data);
}

// Запускается каждый день в 00:00 UTC
module.exports = function() {
  cron.schedule("0 0 * * *", updateBalances);
  updateBalances(); // Также выполняем при запуске
};
