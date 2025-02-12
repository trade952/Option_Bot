#!/bin/bash
while true; do
  echo "🔄 Ελέγχουμε για αλλαγές..."
  
  git add .
  
  if [[ $(git diff --cached) ]]; then
    echo "🔄 Αλλαγές βρέθηκαν. Κάνουμε commit και push..."
    git commit -m "Auto-commit on $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
    echo "✅ Αλλαγές ανέβηκαν στο GitHub."
  else
    echo "✅ Καμία νέα αλλαγή."
  fi

  echo "⏸ Περιμένουμε 5 λεπτά πριν τον επόμενο έλεγχο..."
  sleep 120  # Περιμένει 120 δευτερόλεπτα (2 λεπτά)
done
