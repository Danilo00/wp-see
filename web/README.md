# WP See

Web app per visualizzare le chat esportate da WhatsApp (file `_chat.txt` + allegati) con interfaccia simile a WhatsApp, paginazione e export PDF.

## Requisiti

- Node.js 20+
- Cartelle export WhatsApp nella directory padre (o percorso custom)

## Avvio

```bash
cd web
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Configurazione

Crea o modifica `.env.local`:

```env
CHATS_ROOT=..
DEBUG_ENABLE=false
DEBUG_LEVEL=4
```

- `CHATS_ROOT`: percorso relativo alla cartella `web` dove cercare le cartelle chat (default `..` = root del progetto wp-see).
- Debug: imposta `DEBUG_ENABLE=true` oppure in console del browser `localStorage.setItem('DEBUG_ENABLE','true')`. Livello: `DEBUG_LEVEL` o `localStorage.setItem('DEBUG_LEVEL','2')` (1–4).

## Struttura export WhatsApp

Ogni chat deve essere una cartella contenente:

- `_chat.txt` (o `chat.txt`)
- file allegati referenziati nel txt (foto, audio, video, ecc.)

## Mobile

- Navigazione a schermo intero: lista chat → conversazione (come WhatsApp)
- Pulsante **indietro** per tornare alla lista
- Menu **⋮** con selezione mittente e export PDF (bottom sheet)
- Altezza `100dvh`, safe area (notch/home indicator), touch target ≥ 44px
- Scroll fluido e allegati ridimensionati per schermi piccoli

## Funzionalità

- Lista chat dalla cartella configurata
- Bolle messaggi (verde = tuo nome selezionato, bianco = altri)
- Foto, audio, video e documenti inline
- Paginazione: carica messaggi precedenti in cima
- Export PDF impaginato con allegati

## Selezionare “i tuoi” messaggi

Nel header, menu **I miei messaggi come**: scegli il nome con cui invii i messaggi (salvato per chat in `localStorage`).
