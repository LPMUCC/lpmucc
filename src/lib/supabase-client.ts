import { createBrowserClient } from '@supabase/ssr'

// Single browser client - handles cookies automatically
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
