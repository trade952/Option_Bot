const puppeteer = require('puppeteer');
const express = require('express');
const PocketOptionAPI = require('./services/api');

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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`📡 Το Web Interface τρέχει στη θύρα ${PORT}`));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/google-chrome' // Χρήση του προεγκατεστημένου Chrome στο Render
  });

  const page = await browser.newPage();
  const api = new PocketOptionAPI('UNITED_STATES');
  await api.startWebsocket();

  console.log("🔄 Το bot είναι έτοιμο να ξεκινήσει!");

  while (true) {
    if (botActive) {
      console.log("🔄 Εκτέλεση trading bot...");
      try {
        const favoritePairs = ['EURUSD', 'GBPUSD', 'USDJPY'];
        for (const pair of favoritePairs) {
          console.log(`🔍 Ανάκτηση δεδομένων για το ${pair}...`);
          const candles = await api.getCandles(pair, 'M1', 100);
          console.log(`📊 Δεδομένα Candles: ${candles.slice(0, 5).map(c => c.close)}`);

          const signal = analyzeStrategy(candles);
          if (signal === 'CALL' || signal === 'PUT') {
            console.log(`📈 Ετοιμάζομαι να ανοίξω συναλλαγή ${signal} στο ${pair}`);
            await makeTrade(api, pair, signal, page);
          } else {
            console.log(`⚠️ Χωρίς σήμα συναλλαγής για το ${pair}`);
          }
        }
      } catch (error) {
        console.error('❌ Σφάλμα:', error);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
})();

// Ανάλυση Στρατηγικής
function analyzeStrategy(candles) {
  const closePrices = candles.map(c => c.close);
  const latestPrice = closePrices[closePrices.length - 1];

  console.log(`📈 Τελευταία τιμή: ${latestPrice}`);
  if (latestPrice > 50) return 'CALL';
  else if (latestPrice < 50) return 'PUT';
  else return 'NO_SIGNAL';
}

// Εκτέλεση Συναλλαγής
async function makeTrade(api, pair, signal, page) {
  try {
    console.log(`📈 Προσπάθεια εκτέλεσης συναλλαγής: ${signal} στο ${pair}`);

    let buttonSelector = signal === 'CALL' ? '.button-call-wrap a.btn-call' : '.button-put-wrap a.btn-put';
    const button = await page.$(buttonSelector);

    if (button) {
      console.log(`📍 Βρέθηκε το κουμπί για ${signal}. Εκτέλεση συναλλαγής...`);
      await button.click();
      console.log(`✅ Συναλλαγή ${signal} στο ${pair} ολοκληρώθηκε.`);
    } else {
      console.log(`⚠️ Το κουμπί για ${signal} δεν βρέθηκε. Ελέγξτε τον selector: ${buttonSelector}`);
    }
  } catch (error) {
    console.error(`❌ Σφάλμα κατά την εκτέλεση συναλλαγής για ${pair}:`, error);
  }
}
