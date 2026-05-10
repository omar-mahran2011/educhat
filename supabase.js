import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL || window.__EC_SB_URL__ || 'https://olafmkhjfgjwieruwcwd.supabase.co'
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || window.__EC_SB_KEY__ || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYWZta2hqZmdqd2llcnV3Y3dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTMwMTUsImV4cCI6MjA5MzgyOTAxNX0.-39VV1pHl3lwb89sFfd7cSGN0Iw5AvKrcEXuPd75agE'

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  realtime: { params: { eventsPerSecond: 10 } },
})

export const isConfigured = () => true

// ── Convert Egyptian phone 01xxxxxxxxx → +201xxxxxxxxx ──
export function toE164(phone) {
  const p = phone.replace(/\s|-/g, '')
  if (p.startsWith('+')) return p
  if (p.startsWith('00')) return '+' + p.slice(2)
  if (p.startsWith('0'))  return '+2' + p
  return '+2' + p
}
