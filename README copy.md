# WP See

Web app per visualizzare chat WhatsApp con import zip, MongoDB, AWS S3, UI mobile e export PDF.

## Storage

| Modalità | Quando | Dove |
|----------|--------|------|
| **local** | Dev senza env cloud | `web/chats/` su disco |
| **cloud** | `MONGODB_URI` + AWS configurati | MongoDB (metadati/messaggi) + S3 (media) |

`STORAGE_MODE=auto` (default) sceglie cloud se possibile.

## Avvio

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

## Import chat (zip)

1. Esporta chat da WhatsApp → file `.zip`
2. Nell'app clicca **+ Importa**
3. Zip piccoli: upload diretto. Zip > 4MB in cloud: upload presignato su S3

API:
- `POST /api/chats/upload` — multipart `file`, optional `title`
- `POST /api/chats/upload/presign` — ottiene URL S3
- `POST /api/chats/import` — `{ s3Key, title? }` elabora zip da S3

## Deploy Vercel (repo collegato alla root)

Vedi [README root](../README.md). Root Directory = `.` (non `web`).

Env richieste per produzione:

```
MONGODB_URI=mongodb+srv://...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-1
AWS_S3_BUCKET=...
STORAGE_MODE=auto
```

## Configurazione locale

Vedi `.env.example` per tutte le variabili.

## Funzionalità

- Lista chat, bolle stile WhatsApp, allegati inline
- Paginazione messaggi, export PDF
- UI mobile ottimizzata
- Import zip WhatsApp

## Selezionare “i tuoi” messaggi

Header → **I miei messaggi come** (salvato in `localStorage` per chat).
