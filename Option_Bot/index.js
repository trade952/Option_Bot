const WebSocket = require('ws');

class PocketOptionAPI {
  constructor(url) {
    this.url = url || 'wss://demo-api-eu.po.market/socket.io/?EIO=4&transport=websocket';
    this.ws = null;
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

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

module.exports = PocketOptionAPI;


// **Ανάλυση στρατηγικής EMA + RSI + MACD**
function analyzeStrategy(candles) {
  const closePrices = candles.map(c => c.close);

  const ema50 = EMA.calculate({ period: 50, values: closePrices });
  const ema200 = EMA.calculate({ period: 200, values: closePrices });
  const rsi = RSI.calculate({ period: 14, values: closePrices });
  const macd = MACD.calculate({
    values: closePrices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });

  const latestEMA50 = ema50[ema50.length - 1] || 0;
  const latestEMA200 = ema200[ema200.length - 1] || 0;
  const latestRSI = rsi[rsi.length - 1] || 0;
  const latestMACD = macd[macd.length - 1]?.histogram || 0;

  console.log(`📊 EMA50: ${latestEMA50.toFixed(2)}, EMA200: ${latestEMA200.toFixed(2)}, RSI: ${latestRSI.toFixed(2)}, MACD Histogram: ${latestMACD.toFixed(2)}`);

  if (latestEMA50 > latestEMA200 && latestRSI < 30 && latestMACD > 0) {
    return 'CALL';
  } else if (latestEMA50 < latestEMA200 && latestRSI > 70 && latestMACD < 0) {
    return 'PUT';
  } else {
    return 'NO_SIGNAL';
  }
}
