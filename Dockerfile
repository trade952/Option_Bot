# Χρησιμοποιούμε το Node 18 ως βάση
FROM node:18

# Εγκατάσταση απαραίτητων βιβλιοθηκών για Puppeteer (Chromium και Google Chrome)
RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
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

# Εγκατάσταση Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update && apt-get install -y google-chrome-stable

# Ορίζουμε το working directory
WORKDIR /app

# Αντιγραφή του package.json και εγκατάσταση εξαρτήσεων
COPY Option_Bot/package*.json ./
RUN npm install

# Αντιγραφή όλων των αρχείων από τον φάκελο Option_Bot
COPY Option_Bot/. ./

# Εκθέτουμε το port 10000
EXPOSE 10000

# Ορίζουμε μεταβλητές περιβάλλοντος για το Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Εκκίνηση της εφαρμογής
CMD ["node", "index.js"]
