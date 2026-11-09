import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  const isBrowser = typeof window !== 'undefined';
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://149.130.186.213:8000';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

  // If running in browser over HTTPS (like on Vercel production),
  // route through our secure server proxy to prevent browser Mixed Content (HTTP/HTTPS) block
  if (isBrowser && window.location.protocol === 'https:' && supabaseUrl.startsWith('http://')) {
    supabaseUrl = `${window.location.origin}/api/supabase`;
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
