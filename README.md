# WP See

Visualizzatore web per export chat WhatsApp con MongoDB, AWS S3 e import zip.

## Avvio locale

```bash
cd web && npm install && cp .env.example .env.local && npm run dev
# oppure dalla root: npm install --prefix web && npm run dev
```

Senza `MONGODB_URI` e AWS usa **storage locale** (`web/chats/`).

## Deploy Vercel (repo collegato alla root)

Il progetto Vercel può restare collegato alla **root del repo** (`wp-see/`).  
`vercel.json` in root dice a Vercel di buildare Next.js da `web/package.json`.

### Impostazioni dashboard

| Campo | Valore |
|-------|--------|
| **Root Directory** | `.` oppure vuoto — **non** `web` |
| **Framework Preset** | Next.js |
| **Build / Output Directory** | **vuoti** (usa `vercel.json`) |

> Non impostare `Output Directory` a `public` o `web/.next`: causa errori di build.

### Variabili d'ambiente

| Variabile | Descrizione |
|-----------|-------------|
| `MONGODB_URI` | Connection string MongoDB Atlas |
| `AWS_ACCESS_KEY_ID` | IAM con accesso S3 |
| `AWS_SECRET_ACCESS_KEY` | Secret AWS |
| `AWS_REGION` | es. `eu-west-1` |
| `AWS_S3_BUCKET` | Nome bucket |
| `STORAGE_MODE` | `auto` (default) |

4. **S3 CORS** (per upload zip grandi dal browser):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": ["https://tuo-dominio.vercel.app", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"]
  }
]
```

5. Migra chat già in `web/chats/` verso cloud (una tantum):

```bash
curl -X POST https://tuo-dominio.vercel.app/api/chats/migrate-local \
  -H "x-migrate-secret: TUO_SECRET"
```

Imposta `MIGRATE_SECRET` su Vercel se vuoi proteggere l'endpoint.

Vedi [web/README.md](web/README.md) per dettagli funzionalità.
