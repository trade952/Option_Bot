const WebSocket = require('ws');

class PocketOptionAPI {
  constructor(url) {
    this.url = url || 'wss://demo-api-eu.po.market/socket.io/?EIO=4&transport=websocket';
    this.ws = null;
  }

  async startWebsocket() {
    try {
      await this.connect();
      console.log('✅ WebSocket ξεκίνησε και είναι συνδεδεμένο!');
    } catch (error) {
      console.error('❌ Σφάλμα κατά τη σύνδεση WebSocket:', error.message);
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        console.log('✅ WebSocket συνδεδεμένο!');
        resolve();
      });

      this.ws.on('message', (data) => {
        console.log(`📩 Λήψη δεδομένων: ${data}`);
      });

      this.ws.on('close', () => {
        console.log('❌ Η σύνδεση WebSocket έκλεισε.');
      });

      this.ws.on('error', (error) => {
        console.error(`❌ Σφάλμα WebSocket: ${error.message}`);
        reject(error);
      });
    });
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      console.log(`📤 Αποστολή μηνύματος: ${message}`);
    } else {
      console.log('⚠️ WebSocket δεν είναι συνδεδεμένο.');
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      console.log('🔒 WebSocket έκλεισε.');
    }
  }
}

module.exports = PocketOptionAPI;
