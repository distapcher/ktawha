const axios = require('axios');
const API_KEY = "G5Y8AY1BQRYGFXG5AQKKIW53TWA4SJRIJC";
const CONTRACT = "0xc0634090F2Fe6c6d75e61Be2b949464aBB498973";

async function getKtaBalance(wallet) {
  try {
    const url = `https://mainnet.base.org/api?module=account&action=tokenbalance&contractaddress=${CONTRACT}&address=${wallet}&tag=latest&apikey=${API_KEY}`;
    const res = await axios.get(url);
    const balance = parseFloat(res.data.result) / 1e18;
    return balance.toFixed(6);
  } catch (err) {
    console.error('Error fetching balance for', wallet, err.message);
    return '0';
  }
}

module.exports = { getKtaBalance };