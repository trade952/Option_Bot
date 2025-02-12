const PocketOptionAPI = require('./services/api'); // Σωστή εισαγωγή της κλάσης
const express = require('express');

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
  const latestPrice = closePrices[closePrices.length - 1];

  console.log(`📈 Τελευταία τιμή: ${latestPrice.toFixed(2)}`);

  if (latestPrice > 50) return 'CALL';
  else if (latestPrice < 50) return 'PUT';
  else return 'NO_SIGNAL';
}

// **Εκτέλεση Συναλλαγής**
async function makeTrade(api, pair, signal, page) {
  try {
    console.log(`📈 Προσπάθεια εκτέλεσης συναλλαγής: ${signal} στο ${pair}`);

    // Επιλογή του κατάλληλου κουμπιού
    let buttonSelector;
    if (signal === 'CALL') {
      buttonSelector = '.button-call-wrap a.btn-call';
    } else if (signal === 'PUT') {
      buttonSelector = '.button-put-wrap a.btn-put';
    }

    const button = await page.$(buttonSelector);
    if (button) {
      console.log(`📍 Βρέθηκε το κουμπί για ${signal}. Εκτέλεση συναλλαγής...`);
      await button.click();
      console.log(`✅ Συναλλαγή ${signal} στο ${pair} ολοκληρώθηκε.`);
    } else {
      console.log(`⚠️ Το κουμπί για ${signal} δεν βρέθηκε στο ${pair}.`);
    }

  } catch (error) {
    console.error(`❌ Σφάλμα κατά την εκτέλεση συναλλαγής για ${pair}:`, error);
  }
}

// **Λήψη Αγαπημένων Pairs**
async function getFavoritePairs(page) {
  try {
    const pairs = await page.evaluate(() => {
      const elements = document.querySelectorAll('.assets-favorites-item');
      return Array.from(elements).map(el => el.getAttribute('data-id'));
    });
    console.log(`📋 Αγαπημένα pairs: ${pairs.join(', ')}`);
    return pairs;
  } catch (error) {
    console.error('❌ Σφάλμα κατά την ανάκτηση αγαπημένων pairs:', error);
    return [];
  }
}
