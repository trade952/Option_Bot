// services/api.js
class PocketOptionAPI {
  constructor(region) {
    this.region = region;
    console.log(`📡 Σύνδεση στην περιοχή: ${region}`);
  }

  async startWebsocket() {
    console.log('✅ WebSocket συνδεδεμένο!');
  }

  async getCandles(pair, timeframe, count) {
    console.log(`📩 Ανάκτηση ${count} candles για ${pair} στο διάστημα ${timeframe}`);
    return Array(count).fill().map(() => ({ close: Math.random() * 100 })); // Ψεύτικα δεδομένα για δοκιμές
  }
}

module.exports = PocketOptionAPI;

  