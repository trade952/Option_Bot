const express = require('express');
const puppeteer = require('puppeteer');
const { EMA, RSI, MACD } = require('technicalindicators');

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

// Διαβάζουμε το port από τη μεταβλητή περιβάλλοντος ή χρησιμοποιούμε το 10000
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`📡 Το Web Interface τρέχει στη θύρα ${PORT}`));

(async () => {
  const browser = await puppeteer.launch({
    headless: true, 
    executablePath: '/usr/bin/google-chrome', 
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  console.log('✅ Το Puppeteer ξεκίνησε σωστά με το Google Chrome!');

  await page.goto('https://pocketoption.com');
  console.log('📄 Η σελίδα Pocket Option φορτώθηκε επιτυχώς!');

  while (true) {
    if (botActive) {
      console.log("🔄 Εκτέλεση trading bot...");
      try {
        await page.goto('https://pocketoption.com', { waitUntil: 'networkidle2' });
        console.log('📄 Η σελίδα φορτώθηκε επιτυχώς!');

        const button = await page.$('.button-call-wrap a.btn-call');
        if (button) {
          console.log('📍 Βρέθηκε το κουμπί CALL. Προσπαθώ να κάνω συναλλαγή...');
          await button.click();
          console.log('✅ Η συναλλαγή CALL ολοκληρώθηκε!');
        } else {
          console.log('⚠️ Το κουμπί CALL δεν βρέθηκε. Ελέγξτε αν ο selector είναι σωστός.');
        }
      } catch (error) {
        console.error('❌ Σφάλμα κατά την εκτέλεση του trading bot:', error);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 10000)); // Περιμένουμε 10 δευτερόλεπτα πριν την επόμενη εκτέλεση
  }
})();

// **Ανάλυση Στρατηγικής (Προσωρινά για δοκιμές)**
function analyzeStrategy(candles) {
  const closePrices = candles.map(c => c.close);
  const latestPrice = closePrices[closePrices.length - 1];
  console.log(`📈 Τελευταία τιμή: ${latestPrice}`);

  if (latestPrice > 50) return 'CALL';
  else if (latestPrice < 50) return 'PUT';
  else return 'NO_SIGNAL';
}

// **Εκτέλεση Συναλλαγής**
async function makeTrade(pair, signal, page) {
  try {
    console.log(`📈 Προσπάθεια εκτέλεσης συναλλαγής: ${signal} στο ${pair}`);
    const buttonSelector = signal === 'CALL' ? '.button-call-wrap a.btn-call' : '.button-put-wrap a.btn-put';
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
