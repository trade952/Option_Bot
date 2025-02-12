// Εξασφαλίζουμε ότι έχουμε το Puppeteer για να πάρουμε τη σελίδα (page)
const puppeteer = require('puppeteer');

async function getPage() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://pocketoption.com'); // Αντικατάστησε το με την πραγματική URL
  return page;
}

(async () => {
  const api = new PocketOptionAPI('UNITED_STATES');
  await api.startWebsocket();
  
  const page = await getPage(); // Παίρνουμε τη σελίδα από το Puppeteer

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
            await makeTrade(api, pair, signal, page);  // Περνάμε το `page` στη συναλλαγή
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

// **Εκτέλεση Συναλλαγής**
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
