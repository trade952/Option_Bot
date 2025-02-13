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

// Κύριος κώδικας του bot
(async () => {
  const api = new PocketOptionAPI('UNITED_STATES');
  await api.startWebsocket();

  while (true) {
    if (botActive) {
      console.log("🔄 Εκτέλεση trading bot...");
      try {
        const pairsWithPayout = getAvailablePairsWithPayout();

        pairsWithPayout.forEach(({ pairName, payout }) => {
          console.log(`🔍 Ζεύγος: ${pairName}, Ποσοστό Πληρωμής: ${payout}%`);
          if (parseInt(payout) >= 80) {
            console.log(`⚡ Συναλλαγή μπορεί να γίνει για το ${pairName} με payout ${payout}%`);
            // Κάνε trade εδώ αν θέλεις
          }
        });
      } catch (error) {
        console.error('❌ Σφάλμα:', error);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
})();

// **Συνάρτηση για εξαγωγή αγαπημένων ζευγών και payout**
function getAvailablePairsWithPayout() {
  let pairs = [];
  let assets = document.querySelectorAll(".assets-favorites-item__line");

  assets.forEach(asset => {
    let pairNameElement = asset.querySelector(".assets-favorites-item__label");
    let payoutElement = asset.querySelector(".payout__number");

    if (pairNameElement && payoutElement) {
      let pairName = pairNameElement.innerText.trim();
      let payout = payoutElement.innerText.trim();
      pairs.push({ pairName, payout });
    }
  });

  return pairs;
}
