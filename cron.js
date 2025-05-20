const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const API_KEY = 'G5Y8AY1BQRYGFXG5AQKKIW53TWA4SJRIJC';
const CONTRACT_ADDRESS = '0xc0634090F2Fe6c6d75e61Be2b949464aBB498973';
const dataPath = path.join(__dirname, 'data.json');

function readData() {
  if (!fs.existsSync(dataPath)) return { wallets: [], history: [] };
  return JSON.parse(fs.readFileSync(dataPath));
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

async function fetchBalance(address) {
  const url = `https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=${CONTRACT_ADDRESS}&address=${address}&tag=latest&apikey=${API_KEY}`;
  try {
    const res = await axios.get(url);
    return res.data?.result || "0";
  } catch (err) {
    console.error("Error fetching balance for", address);
    return "0";
  }
}

async function updateBalances() {
  const data = readData();
  const date = new Date().toISOString().split("T")[0];

  const row = { date };
  for (const wallet of data.wallets) {
    const balance = await fetchBalance(wallet);
    row[wallet] = balance;
  }

  data.history.push(row);
  writeData(data);
  console.log("Balances updated for", date);
}

module.exports = function () {
  updateBalances();
  cron.schedule('0 0 * * *', updateBalances);
};