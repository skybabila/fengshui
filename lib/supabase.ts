import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const ADMIN_EMAIL = 'admin@admin.com'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function hasValidConfig(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Config] Missing URL or ANON_KEY', { supabaseUrl: !!supabaseUrl, anonKeyLength: supabaseAnonKey?.length })
    return false
  }
  if (supabaseUrl.includes('your-project-id')) {
    console.error('[Supabase Config] URL contains placeholder')
    return false
  }
  if (supabaseAnonKey.includes('your-anon-key-here')) {
    console.error('[Supabase Config] ANON_KEY contains placeholder')
    return false
  }
  if (supabaseAnonKey.length < 30) {
    console.error('[Supabase Config] ANON_KEY too short', { length: supabaseAnonKey.length })
    return false
  }
  return true
}

let browserClient: SupabaseClient | null = null
let configChecked = false
let isConfigured = false

function checkConfig(): boolean {
  if (configChecked) return isConfigured
  isConfigured = hasValidConfig()
  configChecked = true
  return isConfigured
}

export function getClient(): SupabaseClient | null {
  if (!checkConfig()) return null

  const isBrowser = typeof window !== 'undefined'
  if (!isBrowser) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        storageKey: 'fs-auth-token',
      },
      global: { 
        headers: { 'X-App-Name': 'fengshui-platform' },
        fetch: (url, options) => {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 8000)
          return fetch(url, { ...options, signal: controller.signal })
            .finally(() => clearTimeout(timeout))
        }
      },
    })
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'fs-auth-token',
      },
      global: { 
        headers: { 'X-App-Name': 'fengshui-platform' },
        fetch: (url, options) => {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 8000)
          return fetch(url, { ...options, signal: controller.signal })
            .finally(() => clearTimeout(timeout))
        }
      },
    })
  }
  return browserClient
}

export const supabase = (() => {
  const client = getClient()
  if (client) return client
  
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          then: (cb: (v: any) => void) => Promise.resolve({ data: [], error: null }).then(cb),
        }),
        then: (cb: (v: any) => void) => Promise.resolve({ data: [], error: null }).then(cb),
        order: () => ({ limit: () => ({ then: (cb: (v: any) => void) => Promise.resolve({ data: [] }).then(cb) }) }),
        limit: () => ({ then: (cb: (v: any) => void) => Promise.resolve({ data: [] }).then(cb) }),
      }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } }) }),
    }),
  } as unknown as SupabaseClient
})()

export function isSupabaseConfigured(): boolean {
  return checkConfig()
}

export async function getUserProfile(userId: string) {
  const client = getClient()
  if (!client) return null
  try {
    const { data, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) return null
    return data
  } catch {
    return null
  }
}

interface UserProfile {
  id: string
  role?: string
  points?: number
  [key: string]: any
}

export async function isAdminUser(userId: string, userEmail?: string): Promise<boolean> {
  if (userEmail === ADMIN_EMAIL) return true
  const profile = await getUserProfile(userId) as UserProfile | null
  return profile?.role === 'admin'
}

export function getEmailRedirectTo(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) return siteUrl
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`
  }
  return 'http://localhost:3000'
}
