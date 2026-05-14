# TempVault

TempVault is a lightweight full-stack temporary anonymous vault app.

## Stack

- Frontend: React + Vite + TailwindCSS + React Router + Axios
- Backend: Node.js + Express.js + Multer
- Database and storage: Supabase PostgreSQL + Supabase Storage
- Deployment: Vercel frontend, Render backend

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

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.

### 2) Backend

```bash
cd server
npm install
npm run dev
```

Copy `server/.env.example` to `server/.env` and fill in Supabase values.

## Supabase setup

1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql`.
3. Create a Storage bucket named `tempvault`.
4. Make the bucket public for simple file delivery, or adapt the backend to signed URLs if you prefer private storage.
5. Copy the project URL and service role key into `server/.env`.

## API endpoints

- `POST /api/vault/create`
- `POST /api/vault/unlock`
- `GET /api/vault/:code`

## Deployment

### Vercel

1. Push the frontend root to GitHub.
2. Import the repository in Vercel.
3. Set `VITE_API_BASE_URL` to your Render backend URL.
4. Deploy.

### Render

1. Create a new Web Service from the `server` folder.
2. Set the build command to `npm install`.
3. Set the start command to `npm start`.
4. Add the environment variables from `server/.env.example`.
5. Set `CLIENT_ORIGIN` to the Vercel frontend URL.

## Notes

- Expired vaults are removed lazily during retrieval.
- The app is designed for around 10–50 concurrent users, keeping the architecture simple.
