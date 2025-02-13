const express = require('express');
const PocketOptionAPI = require('./services/PocketOptionAPI');

let botActive = false;
const api = new PocketOptionAPI();  // Μεταφέραμε την αρχικοποίηση του API εδώ

const app = express();

app.get('/', (req, res) => {
  res.send(`
    <h1>Trading Bot Web Interface</h1>
    <p>Status: <strong>${botActive ? '🟢 Ενεργό' : '🔴 Ανενεργό'}</strong></p>
    <button onclick="fetch('/start').then(() => window.location.reload())">Start Bot</button>
    <button onclick="fetch('/stop').then(() => window.location.reload())">Stop Bot</button>
  `);
});

app.get('/start', async (req, res) => {
  botActive = true;
  console.log('🚀 Το bot ξεκίνησε!');
  await api.connect();  // Εγκαθιστούμε τη σύνδεση WebSocket
  res.sendStatus(200);
});

app.get('/stop', (req, res) => {
  botActive = false;
  console.log('⛔️ Το bot σταμάτησε.');
  api.close();  // Κλείνουμε το WebSocket
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`📡 Το Web Interface τρέχει στη θύρα ${PORT}`));

// Κύριος κώδικας του bot
(async () => {
  while (true) {
    if (botActive) {
      console.log('🔄 Εκτέλεση trading bot...');
      
      try {
        if (api.isConnected()) {
          console.log('✅ Το WebSocket είναι συνδεδεμένο.');

          // Παράδειγμα αποστολής μηνύματος και επεξεργασίας στρατηγικής
          api.sendMessage('GET_CANDLES EURUSD M1 100');
        } else {
          console.log('❌ Το WebSocket δεν είναι συνδεδεμένο.');
        }
      } catch (error) {
        console.error('❌ Σφάλμα κατά την εκτέλεση του bot:', error);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
})();

// **Ανάλυση στρατηγικής EMA + RSI + MACD**
function analyzeStrategy(candles) {
  const closePrices = candles.map(c => c.close);

  const ema50 = EMA.calculate({ period: 50, values: closePrices });
  const ema200 = EMA.calculate({ period: 200, values: closePrices });
  const rsi = RSI.calculate({ period: 14, values: closePrices });
  const macd = MACD.calculate({
    values: closePrices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });

  const latestEMA50 = ema50[ema50.length - 1] || 0;
  const latestEMA200 = ema200[ema200.length - 1] || 0;
  const latestRSI = rsi[rsi.length - 1] || 0;
  const latestMACD = macd[macd.length - 1]?.histogram || 0;

  console.log(`📊 EMA50: ${latestEMA50.toFixed(2)}, EMA200: ${latestEMA200.toFixed(2)}, RSI: ${latestRSI.toFixed(2)}, MACD Histogram: ${latestMACD.toFixed(2)}`);

  if (latestEMA50 > latestEMA200 && latestRSI < 30 && latestMACD > 0) {
    return 'CALL';
  } else if (latestEMA50 < latestEMA200 && latestRSI > 70 && latestMACD < 0) {
    return 'PUT';
  } else {
    return 'NO_SIGNAL';
  }
}
