import { createClient } from "@supabase/supabase-js"

// Admin client with service role key - bypasses RLS
// Only use on server-side (API routes, server components)

// Allow build to proceed, validation happens at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Runtime validation (server-side only)
if (typeof window === 'undefined') {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required Supabase admin environment variables')
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'gonstead-admin-api',
      },
    },
    db: {
      schema: 'public',
    },
    // Increased timeout for mobile networks
    // Note: fetch timeout must be set in Next.js config or API route
  }
)

