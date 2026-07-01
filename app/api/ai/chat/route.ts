import { NextResponse } from 'next/server'

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
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
      return NextResponse.json({ reply: randomReply })
    }

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-10).map((m: any) => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ]

    const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
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
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI API error:', response.status, errorText)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const reply = data.choices[0]?.message?.content || ''

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('AI chat error:', error)
    const fallbackReplies = [
      'Your current confusion is very normal. Your life energy is in a stage of adjustment. Keeping a calm mindset will help you see clearer answers.',
      'Recently, you may feel unstable emotionally or mentally. This is a temporary energy fluctuation. Things will gradually become stable if you keep steady rhythm.',
      'You are overthinking some issues. The actual situation is better than you feel. Relax your mind and allow natural progress.',
    ]
    return NextResponse.json({
      reply: fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
    })
  }
}
