const axios = require('axios');

const API_KEY = "G5Y8AY1BQRYGFXG5AQKKIW53TWA4SJRIJC";
const CONTRACT_ADDRESS = "0xc0634090F2Fe6c6d75e61Be2b949464aBB498973";
const BASE_URL = "https://api.basescan.org/api";

async function getKeetaBalance(wallet) {
  const url = \`\${BASE_URL}?module=account&action=tokenbalance&contractaddress=\${CONTRACT_ADDRESS}&address=\${wallet}&tag=latest&apikey=\${API_KEY}\`;

  try {
    const response = await axios.get(url);
    const raw = response.data.result;
    return parseFloat(raw) / 1e18;
  } catch (error) {
    console.error("Error fetching balance:", error.message);
    return 0;
  }
}

module.exports = getKeetaBalance;
