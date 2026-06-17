/**
 * Typed environment variable access.
 * Throws clearly if required variables are missing.
 */
export function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) throw new Error('[Creatvo] NEXT_PUBLIC_SUPABASE_URL is not set in environment variables')
  if (!key) throw new Error('[Creatvo] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in environment variables')

  return {
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: key,
  }
}
