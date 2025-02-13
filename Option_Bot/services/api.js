class PocketOptionAPI {
  constructor(region) {
    this.region = region;
    this.ws = null;
  }

  async startWebsocket() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('wss://demo-api-eu.po.market/socket.io/?EIO=4&transport=websocket');

      this.ws.on('open', () => {
        console.log('✅ WebSocket συνδεδεμένο!');
        resolve();
      });

      this.ws.on('message', (data) => {
        console.log(`📩 Λήψη δεδομένων: ${data}`);
      });

      this.ws.on('error', (error) => {
        console.error('❌ Σφάλμα WebSocket:', error);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('❌ Η σύνδεση WebSocket έκλεισε.');
      });
    });
  }

  getAvailablePairs() {
    return new Promise((resolve, reject) => {
      const pairs = []; // Λίστα για να αποθηκεύσουμε τα ζεύγη

      this.ws.on('message', (data) => {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.type === 'available_pairs') {
            pairs.push(...parsedData.pairs);
            console.log(`⭐ Βρέθηκαν ζεύγη: ${parsedData.pairs.join(', ')}`);
            resolve(pairs);
          }
        } catch (error) {
          reject(`❌ Σφάλμα κατά την ανάγνωση δεδομένων WebSocket: ${error}`);
        }
      });

      setTimeout(() => {
        if (pairs.length === 0) {
          reject('⚠️ Δεν βρέθηκαν διαθέσιμα ζεύγη εντός του χρονικού ορίου.');
        }
      }, 5000); // Μέγιστος χρόνος αναμονής για ζεύγη: 5 δευτερόλεπτα
    });
  }
}

  