# Deployment Guide

## Environment

Create `.env.local` locally and set the same values in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/001_full_schema.sql` in the SQL editor or through the Supabase CLI.
3. Confirm the storage buckets exist: `avatars`, `banners`, `content-thumbnails`, `article-images`.
4. In Authentication settings, add these redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

## Local Verification

```bash
npm install
npm run build
npm run dev
```

`next lint` is not configured yet; running `npm run lint` currently opens Next.js' interactive ESLint setup prompt.

## Vercel

1. Import the project.
2. Set the environment variables above.
3. Use the default Next.js build command: `npm run build`.
4. Deploy.

