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
          console.log(`📢 Σήμα Στρατηγικής για ${pair}: ${signal}`);

          if (signal === 'CALL' || signal === 'PUT') {
            console.log(`📈 Ετοιμάζομαι να ανοίξω συναλλαγή ${signal} στο ${pair}`);
            await makeTrade(api, pair, signal);  // Εκτέλεση συναλλαγής
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

// **Ανάλυση Στρατηγικής**
function analyzeStrategy(candles) {
  console.log('📢 Τεχνητό σήμα: CALL (για δοκιμή)');
  return 'CALL'; // Επιστρέφουμε πάντα CALL για να δοκιμάσουμε τη συναλλαγή
}

// **Εκτέλεση Συναλλαγής**
async function makeTrade(api, pair, signal) {
  try {
    console.log(`📈 Προσπάθεια εκτέλεσης συναλλαγής: ${signal} στο ${pair}`);

    let buttonSelector = signal === 'CALL' ? '.button-call-wrap a.btn-call' : '.button-put-wrap a.btn-put';
    const page = await api.getPage();  // Υποθέτουμε ότι έχεις μια μέθοδο που επιστρέφει τη σελίδα

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
