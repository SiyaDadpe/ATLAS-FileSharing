# TempVault

TempVault is a lightweight full-stack temporary anonymous vault app.

## Stack

- Frontend: React + Vite + TailwindCSS + React Router + Axios
- API: Vercel Serverless Functions
- Database and storage: Supabase PostgreSQL + Supabase Storage
- Deployment: Vercel only

## Features

- Anonymous vault creation
- Multiple file uploads and text notes
- Retrieval code and shareable URL
- Optional secret phrase with bcrypt hashing
- Expiry countdown and lazy deletion
- Modern dark glassmorphism UI
- Local recent vault history
- QR code for shared vault link
- One-time-view option

## Local setup

### 1) Frontend

```bash
npm install
npm run dev
```

Set `VITE_API_BASE_URL` only if you want to override the default `/api` base.
By default the app uses `/api` on the same origin.
For full local testing, use the Vercel CLI or point `VITE_API_BASE_URL` at a deployed Vercel URL.

### 2) API

The API now runs from Vercel serverless functions in the repo root. No separate backend deploy is needed.

## Supabase setup

1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql`.
3. Create a Storage bucket named `tempvault`.
4. Make the bucket public for simple file delivery, or adapt the backend to signed URLs if you prefer private storage.
5. Copy the project URL and service role key into your Vercel environment variables.

## API endpoints

- `POST /api/vault/create`
- `POST /api/vault/unlock`
- `POST /api/vault/consume`
- `GET /api/vault/:code`
- `GET /api/vault/download/:code/:fileId`

## Deployment

### Vercel

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Set these environment variables:
	- `SUPABASE_URL`
	- `SUPABASE_SERVICE_ROLE_KEY`
	- `SUPABASE_STORAGE_BUCKET` if you use a custom bucket name
	- `VITE_API_BASE_URL` optional, defaults to `/api`
4. Deploy.

The Vercel deployment hosts the React app and the API together.

## Notes

- Expired vaults are removed lazily during retrieval.
- Supabase is still the database and storage layer; Vercel only hosts the UI and API code.
- File upload size is still limited by Vercel serverless function limits.
