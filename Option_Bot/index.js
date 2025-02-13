const express = require('express');
const WebSocket = require('ws');  // Βιβλιοθήκη WebSocket
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

// Κύριος κώδικας του WebSocket
(async () => {
  const api = new PocketOptionAPI('UNITED_STATES');
  await api.startWebsocket();

  api.on('message', (data) => {
    const parsedData = JSON.parse(data);

    // Έλεγχος για ζωντανά δεδομένα
    if (parsedData.type === 'favoritePairsUpdate') {
      console.log(`📡 Αγαπημένα Ζευγάρια: ${JSON.stringify(parsedData.pairs)}`);
      
      parsedData.pairs.forEach(pair => {
        console.log(`🔍 Ζεύγος: ${pair.name}, Ποσοστό Πληρωμής: ${pair.payout}%`);
        
        // Εδώ μπορείς να προσθέσεις λογική στρατηγικής για κάθε ζεύγος
        if (pair.payout > 80) {
          console.log(`💡 Στρατηγική: Υψηλό payout στο ${pair.name}, πιθανή ευκαιρία.`);
        }
      });
    }
  });

  while (true) {
    if (botActive) {
      console.log("🔄 Εκτέλεση trading bot...");
      try {
        // Παράδειγμα λογικής συναλλαγών
        console.log("📈 Το bot ετοιμάζεται για συναλλαγή...");
        // Μπορείς να καλέσεις τη στρατηγική σου εδώ
      } catch (error) {
        console.error('❌ Σφάλμα:', error);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
})();
