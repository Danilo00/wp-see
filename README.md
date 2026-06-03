# wp-see

Visualizzatore chat WhatsApp con MongoDB, AWS S3 e import zip.

## Avvio locale

```bash
npm install
cp .env.example .env.local   # oppure copia manualmente su Windows
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

Senza `MONGODB_URI` e AWS usa **storage locale** (`chats/`).

## Struttura

```
wp-see/
  src/          → app Next.js
  chats/        → export WhatsApp (fallback locale)
  public/
  package.json
  vercel.json
```

## Deploy Vercel

Repo collegato alla **root** — nessuna sottocartella `web`.

| Campo | Valore |
|-------|--------|
| **Root Directory** | `.` (vuoto) |
| **Framework** | Next.js |
| **Build / Output Directory** | **vuoti** |

### Variabili d'ambiente

| Variabile | Descrizione |
|-----------|-------------|
| `MONGODB_URI` | MongoDB Atlas |
| `AWS_ACCESS_KEY_ID` | IAM S3 |
| `AWS_SECRET_ACCESS_KEY` | Secret AWS |
| `AWS_REGION` | es. `eu-west-1` |
| `AWS_S3_BUCKET` | Nome bucket |
| `STORAGE_MODE` | `auto` (default) |
| `CHATS_ROOT` | `./chats` (solo locale) |

### S3 CORS (upload zip dal browser)

```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "HEAD"],
  "AllowedOrigins": ["https://tuo-dominio.vercel.app", "http://localhost:3000"],
  "ExposeHeaders": ["ETag"]
}]
```

## Funzionalità

- Visualizzazione chat stile WhatsApp con allegati
- Import zip WhatsApp (**+ Importa**)
- Paginazione, export PDF, UI mobile
- Cloud: MongoDB + S3 | Locale: cartella `chats/`
