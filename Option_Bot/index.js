(async () => {
  const api = new PocketOptionAPI('UNITED_STATES');
  await api.startWebsocket();

  while (true) {
    if (botActive) {
      console.log("🔄 Εκτέλεση trading bot...");
      try {
        const favoritePairs = await getFavoritePairs(page);  // Λήψη αγαπημένων pairs από την οθόνη
        console.log(`📋 Βρέθηκαν τα ακόλουθα αγαπημένα pairs: ${favoritePairs.join(', ')}`);
        
        for (const pair of favoritePairs) {
          console.log(`🔍 Ανάκτηση δεδομένων για το ${pair}...`);
          
          // Προσωρινά χρησιμοποιούμε ψεύτικα δεδομένα
          const candles = Array(100).fill().map(() => ({ close: Math.random() * 100 }));
          console.log(`📊 Δείγμα δεδομένων: ${candles.slice(0, 5).map(c => c.close)}`);

          const signal = analyzeStrategy(candles);
          console.log(`📢 Σήμα για ${pair}: ${signal}`);

          if (signal === 'CALL' || signal === 'PUT') {
            console.log(`📈 Προετοιμασία για συναλλαγή ${signal} στο ${pair}`);
            await makeTrade(api, pair, signal, page);
          } else {
            console.log(`⚠️ Χωρίς σήμα συναλλαγής για το ${pair}`);
          }
        }
      } catch (error) {
        console.error('❌ Σφάλμα:', error);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 10000));  // Καθυστέρηση 10 δευτερολέπτων
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
