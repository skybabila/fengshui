import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const AI_BASE_URL = process.env.AI_BASE_URL || process.env.NEXT_PUBLIC_AI_BASE_URL || ''
const AI_API_KEY = process.env.AI_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY || ''
const AI_MODEL = process.env.AI_MODEL || process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-3.5-turbo'

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

export async function GET() {
  const hasBaseUrl = !!AI_BASE_URL
  const hasApiKey = !!AI_API_KEY
  const maskedKey = AI_API_KEY 
    ? AI_API_KEY.substring(0, 6) + '...' + AI_API_KEY.substring(AI_API_KEY.length - 4)
    : 'not set'

  return NextResponse.json({
    configured: hasBaseUrl && hasApiKey,
    baseUrl: AI_BASE_URL || 'not set',
    model: AI_MODEL,
    apiKey: maskedKey,
    runtime: 'nodejs',
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
      return NextResponse.json({ reply: randomReply, fallback: true })
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

    const response = await fetch(apiUrl, {
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
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[AI Chat] API error status:', response.status)
      console.error('[AI Chat] API error body:', errorText)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || ''

    if (!reply) {
      console.error('[AI Chat] Empty reply from API, data:', JSON.stringify(data))
      throw new Error('Empty reply from AI')
    }

    console.log('[AI Chat] Success, reply length:', reply.length)
    return NextResponse.json({ reply, fallback: false })
  } catch (error) {
    console.error('[AI Chat] Error:', error)
    const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
    return NextResponse.json({
      reply: randomReply,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
