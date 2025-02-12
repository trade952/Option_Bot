(async () => {
  const api = new PocketOptionAPI('UNITED_STATES');
  await api.startWebsocket();

  while (true) {
    if (botActive) {
      console.log("🔄 Εκτέλεση trading bot...");
      try {
        const favoritePairs = await getFavoritePairs(page);  // Ανάκτηση των αγαπημένων
        for (const pair of favoritePairs) {
          console.log(`🔍 Ανάκτηση δεδομένων για το ${pair}...`);
          const candles = await api.getCandles(pair, 'M1', 100);

          if (candles.length >= 50) {
            const signal = analyzeStrategy(candles);
            if (signal === 'CALL' || signal === 'PUT') {
              await makeTrade(api, pair, signal);
            } else {
              console.log(`⚠️ Χωρίς σήμα συναλλαγής για το ${pair}`);
            }
          } else {
            console.log(`⚠️ Λιγότερα από 50 κεριά διαθέσιμα για το ${pair}.`);
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
  const closePrices = candles.map(c => c.close);

  if (closePrices.length < 200) {
    console.log('❗️ Not enough data for analysis.');
    return 'NO_SIGNAL';
  }

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

// **Λειτουργία για Εκτέλεση Συναλλαγής**
async function makeTrade(api, assetName, type) {
  try {
    console.log(`📈 Εκτέλεση συναλλαγής: ${type} στο ${assetName}`);
    const tradeResponse = await api.buyv3.execute(assetName, type, 1);  // Ποσό: 1 (προσαρμόσιμο)

    console.log(`🛠 Trade response:`, tradeResponse);

    if (tradeResponse && tradeResponse.success) {
      console.log(`✅ Συναλλαγή ${type} στο ${assetName} ολοκληρώθηκε επιτυχώς.`);
      logTrade(assetName, type, 'SUCCESS');
    } else {
      console.log(`❌ Αποτυχία συναλλαγής στο ${assetName}: ${tradeResponse?.message || 'No response'}`);
      logTrade(assetName, type, 'FAILURE');
    }
  } catch (error) {
    console.error(`❌ Σφάλμα κατά την εκτέλεση συναλλαγής για το ${assetName}:`, error);
    logTrade(assetName, type, 'ERROR');
  }
}

// **Καταγραφή συναλλαγών**
function logTrade(assetName, type, status) {
  const logMessage = `${new Date().toISOString()} - ${type} trade on ${assetName}: ${status}\n`;
  fs.appendFileSync('trade_log.txt', logMessage);
  console.log(`📝 Καταγραφή: ${logMessage}`);
}

// **Καταγραφή σφαλμάτων**
function logError(message) {
  const logMessage = `${new Date().toISOString()} - ERROR: ${message}\n`;
  fs.appendFileSync('error_log.txt', logMessage);
  console.error(`🛑 Καταγραφή σφάλματος: ${logMessage}`);
}
