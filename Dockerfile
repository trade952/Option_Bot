# Χρησιμοποιούμε το Node 18 ως βάση
FROM node:18

# Εγκατάσταση απαραίτητων βιβλιοθηκών για Puppeteer (Chromium)
RUN apt-get update && apt-get install -y \
  libnss3 \
  libxss1 \
  libasound2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  fonts-liberation \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libxfixes3 \
  libxi6 \
  libxtst6 \
  libgl1-mesa-glx \
  libxkbcommon0 \
  xdg-utils \
  && rm -rf /var/lib/apt/lists/*

# Ορίζουμε το working directory
WORKDIR /app

# Αντιγραφή του package.json και εγκατάσταση εξαρτήσεων
COPY Option_Bot/package*.json ./
RUN npm install

# Αντιγραφή όλων των αρχείων από τον φάκελο Option_Bot
COPY Option_Bot/. ./

# Εκθέτουμε το port 10000 (το Render θα χρησιμοποιήσει τη μεταβλητή PORT)
EXPOSE 10000

# Εκκίνηση της εφαρμογής
CMD ["node", "index.js"]
