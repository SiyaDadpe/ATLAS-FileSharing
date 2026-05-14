# TempVault Backend

## Run locally

1. Copy `.env.example` to `.env`
2. Fill in Supabase values
3. Install dependencies
4. Run `npm run dev`

## Required environment variables

- `PORT`
- `CLIENT_ORIGIN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

## Notes

- The backend uses the Supabase service role key only on the server.
- Files are uploaded with Multer memory storage and then sent to Supabase Storage.
- Expired vaults are deleted lazily when someone tries to open them.
