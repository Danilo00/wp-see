# WP See

Web app per visualizzare le chat esportate da WhatsApp (file `_chat.txt` + allegati) con interfaccia simile a WhatsApp, paginazione e export PDF.

## Requisiti

- Node.js 20+
- Le chat sono incluse in `web/chats/` (o percorso custom via `CHATS_ROOT`)

## Avvio

```bash
cd web
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Deploy Vercel

1. Importa il repo [Danilo00/wp-see](https://github.com/Danilo00/wp-see)
2. Imposta **Root Directory** = `web`
3. Variabile d'ambiente: `CHATS_ROOT` = `./chats` (già in `web/vercel.json`)
4. Redeploy dopo ogni push su `main`

## Tunnel ngrok (dev)

```bash
cd web && npm run dev
ngrok http 3000
```

`next dev` accetta host ngrok via `allowedDevOrigins` in `next.config.ts`. Usa la porta mostrata nel terminale (3000 o 3001).

## Configurazione

Crea o modifica `.env.local`:

```env
CHATS_ROOT=./chats
DEBUG_ENABLE=false
DEBUG_LEVEL=4
```

- `CHATS_ROOT`: percorso relativo alla cartella `web` dove cercare le cartelle chat (default `./chats`).
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
