import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton pattern — only ONE client instance ever created in the browser
let clientInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (clientInstance) return clientInstance
  clientInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    }
  )
  return clientInstance
}

// Export a direct instance for convenience
export const supabase = typeof window !== 'undefined' 
  ? getSupabaseClient()
  : createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
