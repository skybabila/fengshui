import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

// GET /api/articles/[id] - Get single article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminClient = getAdminClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    const { id } = params
    // Try numeric ID first, then slug
    const isNumeric = /^\d+$/.test(id)
    
    let query = adminClient.from('articles').select('*')
    if (isNumeric) {
      query = query.eq('id', parseInt(id))
    } else {
      query = query.eq('slug', id)
    }

    const { data, error } = await query.single()
    if (error) return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    return NextResponse.json({ article: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/articles/[id] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminClient = getAdminClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    const { id } = params
    const body = await request.json()
    const { title, excerpt, content, category, image, author, status } = body

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (title !== undefined) {
      updates.title = title
      updates.slug = slugify(title) + '-' + Date.now().toString(36)
    }
    if (excerpt !== undefined) updates.excerpt = excerpt
    if (content !== undefined) updates.content = content
    if (category !== undefined) updates.category = category
    if (image !== undefined) updates.image = image
    if (author !== undefined) updates.author = author
    if (status !== undefined) updates.status = status

    const { data, error } = await adminClient
      .from('articles')
      .update(updates)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ article: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminClient = getAdminClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    const { id } = params
    const { error } = await adminClient.from('articles').delete().eq('id', parseInt(id))
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}