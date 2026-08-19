@echo off
:: Avvia npm in background o in una nuova finestra
start cmd /k "npm run dev"

:: Attende 7 secondi per dare tempo al server di avviarsi
timeout /t 7 /nobreak > nul

:: Apre il browser
start http://localhost:3000/