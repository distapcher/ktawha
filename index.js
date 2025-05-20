import express from 'express';
import fetch from 'node-fetch'; // если версия Node 18+, fetch уже встроен, можно без импорта
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const BASE_URL = "https://api.basescan.org/api"; // пример API Base (проверь сам)
const CONTRACT_ADDRESS = "0xc0634090F2Fe6c6d75e61Be2b949464aBB498973";
const API_KEY = "G5Y8AY1BQRYGFXG5AQKKIW53TWA4SJRIJC";

let wallets = [];
let balancesHistory = []; // массив объектов { date: 'YYYY-MM-DD', balances: [балансы по кошелькам] }

// Функция для получения баланса токена для одного кошелька
async function fetchBalance(wallet) {
  const url = `${BASE_URL}?module=account&action=tokenbalance&contractaddress=${CONTRACT_ADDRESS}&address=${wallet}&tag=latest&apikey=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.status === "1") {
    return BigInt(json.result) / 10n ** 18n; // считаем с 18 знаками после запятой, токен с 18 decimals
  } else {
    return 0n;
  }
}

// Получить балансы для всех кошельков
async function fetchBalancesAll() {
  const balances = [];
  for (const wallet of wallets) {
    try {
      const bal = await fetchBalance(wallet);
      balances.push(bal.toString());
    } catch {
      balances.push("Error");
    }
  }
  return balances;
}

// Запуск сервера и маршрутов

// Главная страница с формой
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Получение балансов POST (при отправке формы)
app.post('/balances', async (req, res) => {
  const input = req.body.wallets || "";
  wallets = input.split('\n').map(w => w.trim()).filter(w => w.length > 0);

  const balances = await fetchBalancesAll();

  // Добавим первый день
  const today = new Date().toISOString().slice(0, 10);
  balancesHistory = [{ date: today, balances }];

  res.json({ wallets, balancesHistory });
});

// Маршрут для обновления балансов в полночь (клиент будет опрашивать)
app.get('/balancesHistory', (req, res) => {
  res.json({ wallets, balancesHistory });
});

// Функция запуска ежедневного обновления балансов в 00:00
function scheduleDailyUpdate() {
  const now = new Date();
  // время до следующей полуночи
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const msToMidnight = nextMidnight - now;

  setTimeout(async () => {
    if (wallets.length > 0) {
      const balances = await fetchBalancesAll();
      const today = new Date().toISOString().slice(0, 10);
      balancesHistory.push({ date: today, balances });
      console.log('Balances updated for', today);
    }
    scheduleDailyUpdate(); // рекурсивно запланировать следующий запуск
  }, msToMidnight);
}

scheduleDailyUpdate();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});