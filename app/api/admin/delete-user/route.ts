import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Admin delete user error:', deleteError)
      let message = deleteError.message || 'Unknown error'
      if (/API key|invalid key|invalid.*key/i.test(message) || /jwt|invalid.*token/i.test(message)) {
        message = 'The key format is not recognized by the Supabase SDK. ' +
          'Use the Legacy service_role key (starts with eyJ...) from the "Legacy anon, service_role API keys" tab in Supabase Settings → API Keys. ' +
          'After updating SUPABASE_SERVICE_ROLE_KEY in Vercel, click Redeploy.'
      }
      return NextResponse.json(
        { error: message, detail: deleteError.code || deleteError.status || '' },
        { status: deleteError.status || 500 }
      )
    }

    await adminClient.from('user_profiles').delete().eq('id', userId)
    await adminClient.from('daily_fortunes').delete().eq('user_id', userId)
    await adminClient.from('prayers').delete().eq('user_id', userId)
    await adminClient.from('point_transactions').delete().eq('user_id', userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
