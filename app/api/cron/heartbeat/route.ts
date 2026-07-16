import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function performRandomOperation(): Promise<{ type: string; details: string }> {
  const operations = [
    // Write operations
    async () => {
      const { error } = await supabase
        .from('heartbeat')
        .upsert({
          id: 'system',
          last_ping: new Date().toISOString(),
          random_value: Math.floor(Math.random() * 1000),
          count: { increment: 1 }
        })
      return { type: 'heartbeat_write', details: error ? `Failed: ${error.message}` : 'Success' }
    },
    
    // Read operations
    async () => {
      const { count, error } = await supabase.from('user_profiles').select('*', { count: 'exact' })
      return { type: 'user_profiles_read', details: error ? `Failed: ${error.message}` : `Found ${count} users` }
    },
    
    async () => {
      const { count, error } = await supabase.from('articles').select('*', { count: 'exact' })
      return { type: 'articles_read', details: error ? `Failed: ${error.message}` : `Found ${count} articles` }
    },
    
    async () => {
      const { count, error } = await supabase.from('wishes').select('*', { count: 'exact' })
      return { type: 'wishes_read', details: error ? `Failed: ${error.message}` : `Found ${count} wishes` }
    },
    
    async () => {
      const { count, error } = await supabase.from('prayers').select('*', { count: 'exact' })
      return { type: 'prayers_read', details: error ? `Failed: ${error.message}` : `Found ${count} prayers` }
    }
  ]
  
  const randomIndex = Math.floor(Math.random() * operations.length)
  return await operations[randomIndex]()
}

export async function GET() {
  try {
    const timestamp = new Date().toISOString()
    
    // Perform 2-3 random operations
    const operationCount = Math.floor(Math.random() * 2) + 2
    const results: { type: string; details: string }[] = []
    
    for (let i = 0; i < operationCount; i++) {
      const result = await performRandomOperation()
      results.push(result)
      
      // Small delay between operations to avoid hitting rate limits
      if (i < operationCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp,
      operations: results,
      message: `Successfully performed ${results.length} database operations`
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}