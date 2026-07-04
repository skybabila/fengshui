import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Clean env value: strip backticks, quotes, spaces
function cleanEnv(val: string): string {
  return val.replace(/[`"' ]/g, '').trim()
}

// Normalize model name: "Agnes 2.0 Flash" -> "agnes-2.0-flash"
function normalizeModel(val: string): string {
  const cleaned = val.trim()
  // If already lowercase with dashes, return as-is
  if (/^[a-z0-9._-]+$/.test(cleaned)) return cleaned
  // Convert "Agnes 2.0 Flash" -> "agnes-2.0-flash"
  return cleaned.toLowerCase().replace(/\s+/g, '-')
}

const AI_BASE_URL = cleanEnv(
  process.env.AI_BASE_URL || 
  process.env.NEXT_PUBLIC_AI_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  process.env.OPENAI_API_BASE ||
  ''
)

const AI_API_KEY = cleanEnv(
  process.env.AI_API_KEY || 
  process.env.NEXT_PUBLIC_AI_API_KEY ||
  process.env.OPENAI_API_KEY ||
  ''
)

const AI_MODEL = normalizeModel(
  process.env.AI_MODEL || 
  process.env.NEXT_PUBLIC_AI_MODEL ||
  process.env.OPENAI_MODEL ||
  'gpt-3.5-turbo'
)

const systemPrompt = `You are a gentle AI spiritual wellness guide. Your role is to provide compassionate, thoughtful guidance about life, relationships, career, mental health, and personal growth. 

Important guidelines:
- Speak in a warm, calming, and supportive tone
- Focus on wellness, positive thinking, and personal reflection
- Do not make definitive predictions about the future
- Do not provide medical, legal, or financial advice
- Encourage self-reflection and inner wisdom
- Keep responses thoughtful but not overly long
- All content is for entertainment and personal reflection only

The user is seeking spiritual and wellness guidance. Respond with empathy and gentle wisdom.`

const fallbackReplies = [
  'Your current confusion is very normal. Your life energy is in a stage of adjustment. Keeping a calm mindset will help you see clearer answers.',
  'Recently, you may feel unstable emotionally or mentally. This is a temporary energy fluctuation. Things will gradually become stable if you keep steady rhythm.',
  'You are overthinking some issues. The actual situation is better than you feel. Relax your mind and allow natural progress.',
  'Your recent effort is accumulating quietly. Although you cannot see results immediately, positive changes are on the way.',
  'In terms of relationships, gentle communication and patience will resolve most misunderstandings.',
  'In terms of career, steady progress is more important than fast progress right now.',
  'Your inner wisdom is stronger than you realize. Take some quiet time to listen to your own intuition.',
  'What you seek is also seeking you. Trust the timing of your life and have faith in the process.',
  'Small consistent steps lead to big transformations. Be gentle with yourself as you grow.',
  'Your energy field is shifting and realigning. Embrace the changes rather than resisting them.',
]

function getEnvStatus() {
  const envVars = [
    'AI_BASE_URL', 'NEXT_PUBLIC_AI_BASE_URL', 'OPENAI_BASE_URL', 'OPENAI_API_BASE',
    'AI_API_KEY', 'NEXT_PUBLIC_AI_API_KEY', 'OPENAI_API_KEY',
    'AI_MODEL', 'NEXT_PUBLIC_AI_MODEL', 'OPENAI_MODEL'
  ]
  
  const status: Record<string, string> = {}
  envVars.forEach(name => {
    const val = process.env[name]
    if (val) {
      if (name.toLowerCase().includes('key')) {
        status[name] = val.substring(0, 6) + '...' + val.substring(val.length - 4)
      } else {
        status[name] = val
      }
    } else {
      status[name] = '(not set)'
    }
  })
  
  return status
}

export async function GET() {
  const hasBaseUrl = !!AI_BASE_URL
  const hasApiKey = !!AI_API_KEY

  return NextResponse.json({
    configured: hasBaseUrl && hasApiKey,
    baseUrl: AI_BASE_URL || '(not set)',
    model: AI_MODEL,
    apiKeySet: hasApiKey,
    runtime: 'nodejs',
    envVars: getEnvStatus(),
  })
}

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      )
    }

    if (!AI_BASE_URL || !AI_API_KEY) {
      console.log('[AI Chat] AI not configured, using fallback replies')
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
      return NextResponse.json({ 
        reply: randomReply, 
        fallback: true,
        fallbackReason: 'AI not configured - missing base URL or API key'
      })
    }

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-10).map((m: any) => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ]

    const baseUrl = AI_BASE_URL.endsWith('/') 
      ? AI_BASE_URL.slice(0, -1) 
      : AI_BASE_URL
    const apiUrl = `${baseUrl}/chat/completions`
    
    console.log('[AI Chat] Calling API:', apiUrl, 'model:', AI_MODEL)

    const startTime = Date.now()
    let response: Response
    
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 800
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(30000),
      })
    } catch (fetchError: any) {
      console.error('[AI Chat] Fetch error:', fetchError.message)
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
      return NextResponse.json({
        reply: randomReply,
        fallback: true,
        fallbackReason: `Network error: ${fetchError.message}`,
        duration: Date.now() - startTime
      })
    }

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[AI Chat] API error status:', response.status)
      console.error('[AI Chat] API error body:', errorText)
      
      let errorMsg = `HTTP ${response.status}`
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.error?.message) {
          errorMsg += `: ${errorJson.error.message}`
        }
      } catch {}
      
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
      return NextResponse.json({
        reply: randomReply,
        fallback: true,
        fallbackReason: errorMsg,
        status: response.status,
        duration: responseTime
      })
    }

    let data: any
    try {
      data = await response.json()
    } catch (parseError: any) {
      console.error('[AI Chat] JSON parse error:', parseError.message)
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
      return NextResponse.json({
        reply: randomReply,
        fallback: true,
        fallbackReason: `JSON parse error: ${parseError.message}`,
        duration: responseTime
      })
    }

    const reply = data.choices?.[0]?.message?.content || ''

    if (!reply) {
      console.error('[AI Chat] Empty reply from API, data:', JSON.stringify(data).substring(0, 500))
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
      return NextResponse.json({
        reply: randomReply,
        fallback: true,
        fallbackReason: 'Empty reply from API',
        duration: responseTime
      })
    }

    console.log('[AI Chat] Success, reply length:', reply.length, 'time:', responseTime + 'ms')
    return NextResponse.json({ 
      reply, 
      fallback: false,
      duration: responseTime
    })
  } catch (error) {
    console.error('[AI Chat] Unexpected error:', error)
    const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
    return NextResponse.json({
      reply: randomReply,
      fallback: true,
      fallbackReason: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
