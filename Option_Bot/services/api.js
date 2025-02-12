// services/api.js - Example API file
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
      return []; // Προσωρινά επιστρέφουμε κενό array
    }
  }
  
  module.exports = PocketOptionAPI;

  