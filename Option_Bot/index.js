const express = require('express');
const { EMA, RSI, MACD } = require('technicalindicators');
const PocketOptionAPI = require('./services/api');

let botActive = false;
const app = express();

// Web Interface
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
  const api = new PocketOptionAPI('UNITED_STATES');
  await api.startWebsocket();

  while (true) {
    if (botActive) {
      console.log("🔄 Εκτέλεση trading bot...");
      try {
        const favoritePairs = ['EURUSD', 'GBPUSD', 'USDJPY'];
        for (const pair of favoritePairs) {
          console.log(`🔍 Ανάκτηση δεδομένων για το ${pair}...`);
          const candles = await api.getCandles(pair, 'M1', 100);

          if (candles.length > 0) {
            const signal = analyzeStrategy(candles);
            console.log(`📊 Σήμα: ${signal}`);
            
            if (signal === 'CALL' || signal === 'PUT') {
              await makeTrade(api, pair, signal);
            } else {
              console.log(`⚠️ Χωρίς σήμα συναλλαγής για το ${pair}`);
            }
          }
        }
      } catch (error) {
        console.error('❌ Σφάλμα:', error);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
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

// **Λειτουργία για Εκτέλεση Συναλλαγής**
async function makeTrade(api, assetName, type) {
  try {
    console.log(`📈 Εκτέλεση συναλλαγής: ${type} στο ${assetName}`);
    const tradeResponse = await api.buyv3.execute(assetName, type, 1); // Ποσό: 1
    if (tradeResponse.success) {
      console.log(`✅ Συναλλαγή ${type} στο ${assetName} ολοκληρώθηκε επιτυχώς.`);
    } else {
      console.log(`❌ Αποτυχία συναλλαγής στο ${assetName}:`, tradeResponse.message);
    }
  } catch (error) {
    console.error(`❌ Σφάλμα κατά την εκτέλεση συναλλαγής για το ${assetName}:`, error);
  }
}
