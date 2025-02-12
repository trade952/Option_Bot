const express = require('express');
const puppeteer = require('puppeteer');
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`📡 Το Web Interface τρέχει στη θύρα ${PORT}`));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  console.log('✅ Το Puppeteer ξεκίνησε σωστά με το ενσωματωμένο Chromium!');

  while (true) {
    if (botActive) {
      console.log("🔄 Εκτέλεση trading bot...");
      try {
        await page.goto('https://pocketoption.com');
        console.log('📄 Σελίδα φορτώθηκε επιτυχώς!');
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

