#!/bin/bash

# Πήγαινε στο project directory
cd ~/Desktop/Option_Bot_Setup/Option_Bot || exit

# Έλεγχος κατάστασης Git
if [[ $(git status --porcelain) ]]; then
  echo "🔄 Αλλαγές βρέθηκαν. Κάνουμε commit και push..."
  
  # Προσθήκη όλων των αλλαγών
  git add -A

  # Κάνε commit με timestamp στο μήνυμα
  git commit -m "Auto-commit on $(date +"%Y-%m-%d %H:%M:%S")"

  # Κάνε push τις αλλαγές
  git push origin main

  echo "✅ Αλλαγές ανέβηκαν στο GitHub."
else
  echo "👌 Δεν υπάρχουν αλλαγές."
fi
