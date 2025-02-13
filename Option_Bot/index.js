const express = require('express');
const puppeteer = require('puppeteer');

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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`📡 Το Web Interface τρέχει στη θύρα ${PORT}`));

(async () => {
  const { execSync } = require('child_process');
  let chromePath;

  try {
    chromePath = execSync('which google-chrome').toString().trim();
    console.log(`✅ Βρέθηκε το Google Chrome στο: ${chromePath}`);
  } catch (error) {
    console.error('❌ Το Google Chrome δεν βρέθηκε! Βεβαιωθείτε ότι είναι σωστά εγκατεστημένο.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  console.log('✅ Το Puppeteer ξεκίνησε σωστά με το Google Chrome!');

  await page.goto('https://pocketoption.com');
  console.log('📄 Η σελίδα Pocket Option φορτώθηκε επιτυχώς!');

  await browser.close();
})();
