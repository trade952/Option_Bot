#!/bin/bash

# Δημιουργία του φακέλου και μετάβαση σε αυτόν
mkdir Option_Bot
cd Option_Bot

# Αρχικοποίηση του project και εγκατάσταση εξαρτήσεων
npm init -y
npm install express puppeteer technicalindicators

# Δημιουργία φακέλων και αρχείων
mkdir services
touch index.js services/api.js services/candles.js services/buyv3.js

# Προσθήκη κώδικα στο index.js
cat <<EOL > index.js
const express = require('express');
const puppeteer = require('puppeteer');
const { EMA, RSI, MACD } = require('technicalindicators');
const PocketOptionAPI = require('./services/api');

let botActive = false;
const app = express();

// Web Interface
app.get('/', (req, res) => {
  res.send(\`
    <h1>Trading Bot Web Interface</h1>
    <p>Status: <strong>\${botActive ? '🟢 Ενεργό' : '🔴 Ανενεργό'}</strong></p>
    <button onclick="fetch('/start').then(() => window.location.reload())">Start Bot</button>
    <button onclick="fetch('/stop').then(() => window.location.reload())">Stop Bot</button>
  \`);
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
app.listen(PORT, () => console.log(\`📡 Το Web Interface τρέχει στη θύρα \${PORT}\`));

(async () => {
  const api = new PocketOptionAPI('UNITED_STATES');
  await api.startWebsocket();

  while (true) {
    if (botActive) {
      console.log("🔄 Εκτέλεση trading bot...");
      try {
        const favoritePairs = ['EURUSD', 'GBPUSD', 'USDJPY'];
        for (const pair of favoritePairs) {
          console.log(\`🔍 Ανάκτηση δεδομένων για το \${pair}...\`);
          const candles = await api.getCandles(pair, 'M1', 100);
          if (candles.length > 0) {
            const signal = analyzeStrategy(candles);
            console.log(\`📊 Σήμα: \${signal}\`);
          }
        }
      } catch (error) {
        console.error('❌ Σφάλμα:', error);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
})();

function analyzeStrategy(candles) {
  const closePrices = candles.map(c => c.close);
  const ema50 = EMA.calculate({ period: 50, values: closePrices });
  const ema200 = EMA.calculate({ period: 200, values: closePrices });
  const latestEMA50 = ema50[ema50.length - 1] || 0;
  const latestEMA200 = ema200[ema200.length - 1] || 0;
  return latestEMA50 > latestEMA200 ? 'CALL' : 'PUT';
}
EOL

# Δημιουργία placeholder κώδικα στα υπόλοιπα αρχεία
echo "// services/api.js - Example API file" > services/api.js
echo "// services/candles.js - Example candles logic" > services/candles.js
echo "// services/buyv3.js - Example buy logic" > services/buyv3.js

# Μήνυμα ολοκλήρωσης
echo "✅ Το project δημιουργήθηκε επιτυχώς στο Option_Bot!"
