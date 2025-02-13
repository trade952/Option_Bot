const express = require('express');
const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');

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

// Διαβάζουμε το port από τη μεταβλητή περιβάλλοντος ή χρησιμοποιούμε το 10000
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`📡 Το Web Interface τρέχει στη θύρα ${PORT}`));

// Έλεγχος αν το Google Chrome υπάρχει στη διαδρομή και εκκίνηση του Puppeteer
(async () => {
  try {
    const chromePath = execSync('which google-chrome-stable').toString().trim();
    console.log(`✅ Βρέθηκε το Google Chrome στο: ${chromePath}`);

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: chromePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('✅ Το Puppeteer ξεκίνησε σωστά με το Google Chrome!');
    
    const page = await browser.newPage();
    await page.goto('https://pocketoption.com');
    console.log('📄 Η σελίδα Example φορτώθηκε επιτυχώς!');
    
    await browser.close();
  } catch (error) {
    console.error('❌ Σφάλμα κατά την εκκίνηση του Puppeteer:', error);
    process.exit(1); // Τερματίζουμε την εφαρμογή αν δεν βρεθεί το Google Chrome
  }
})();

