const WebSocket = require('ws');
const express = require('express');
const { EMA, RSI, MACD } = require('technicalindicators');

let botActive = false;
const app = express();

app.get('/', (req, res) => {
  res.send(`
    <h1>Trading Bot Web Interface</h1>
    <p>Status: <strong>${botActive ? '🟢 Ενεργό' : '🔴 Ανενεργό'}</strong></p>
    <button onclick="fetch('/start').then(() => window.location.reload())">Start Bot</button>
    <button onclick="fetch('/stop').then(() => window.location.reload())">Stop Bot</button>
  `);
});

app.get('/start', (req, res) => {
  botActive = true;
  console.log('🚀 Το bot ξεκίνησε!');
  res.sendStatus(200);
});

app.get('/stop', (req, res) => {
  botActive = false;
  console.log('⛔️ Το bot σταμάτησε.');
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`📡 Το Web Interface τρέχει στη θύρα ${PORT}`));

(async () => {
  const ws = new WebSocket('wss://demo-api-eu.po.market/socket.io/?EIO=4&transport=websocket');

  ws.on('open', () => {
    console.log('✅ WebSocket συνδεδεμένο!');
  });

  ws.on('message', async (data) => {
    console.log(`📩 Λήψη δεδομένων: ${data}`);

    if (botActive) {
      const parsedData = JSON.parse(data); // Προσαρμόστε το ανάλογα με το format των δεδομένων
      const candles = parsedData.candles || []; // Παράδειγμα εξαγωγής των candles

      if (candles.length > 0) {
        const signal = analyzeStrategy(candles);
        console.log(`📊 Σήμα: ${signal}`);

        if (signal === 'CALL' || signal === 'PUT') {
          await makeTrade(parsedData.pair, signal); // Παράδειγμα συναλλαγής
        } else {
          console.log('⚠️ Χωρίς σήμα συναλλαγής.');
        }
      }
    }
  });

  ws.on('close', () => {
    console.log('❌ Η σύνδεση WebSocket έκλεισε.');
  });

  ws.on('error', (error) => {
    console.error(`❌ Σφάλμα WebSocket: ${error.message}`);
  });
})();

// **Ανάλυση Στρατηγικής**
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

// **Εκτέλεση Συναλλαγής**
async function makeTrade(pair, type) {
  try {
    console.log(`📈 Εκτέλεση συναλλαγής: ${type} στο ${pair}`);
    // Προσάρμοσε εδώ τη λογική για εκτέλεση συναλλαγής μέσω API ή άλλης μεθόδου
    console.log(`✅ Συναλλαγή ${type} στο ${pair} ολοκληρώθηκε.`);
  } catch (error) {
    console.error(`❌ Σφάλμα κατά την εκτέλεση συναλλαγής: ${error.message}`);
  }
}
