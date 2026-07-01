'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import SidebarLayout from '@/components/SidebarLayout'
import { MessageCircle, Send, Coins, Sparkles, Clock, Bot, User } from 'lucide-react'

const aiReplies = [
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

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AISpiritualChatPage() {
  const [user, setUser] = useState<any>(null)
  const [points, setPoints] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionRounds, setSessionRounds] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const SESSION_COST = 20
  const MAX_ROUNDS = 5

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const profile = await getUserProfile(user.id)
        setPoints(profile?.points || 0)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startSession = async () => {
    if (!user) return
    if (points < SESSION_COST) {
      alert('Not enough coins!')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: points - SESSION_COST })
        .eq('id', user.id)
      
      if (updateError) throw updateError
      setPoints(prev => prev - SESSION_COST)

      const { data, error: insertError } = await supabase
        .from('ai_chat_sessions')
        .insert({
          user_id: user.id,
          coins_spent: SESSION_COST,
          rounds_used: 0,
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      setSessionId(data.id)
      setSessionStarted(true)
      setSessionRounds(0)

      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Hello, I'm your AI spiritual wellness guide. I'm here to listen and offer gentle guidance for whatever is on your mind. Whether it's about relationships, career, health, or life direction, feel free to share. How can I support you today?",
        timestamp: new Date(),
      }])
    } catch (err) {
      alert('Failed to start session. Please try again.')
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping || !sessionStarted) return
    if (sessionRounds >= MAX_ROUNDS) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    setTimeout(async () => {
      const randomReply = aiReplies[Math.floor(Math.random() * aiReplies.length)]
      const additional = sessionRounds >= 2 
        ? '\n\nIs there anything else on your mind? Feel free to share more details and I can offer deeper guidance.'
        : sessionRounds >= 1
        ? '\n\nWould you like to explore this further? Tell me more about how this makes you feel.'
        : ''

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomReply + additional,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
      const newRounds = sessionRounds + 1
      setSessionRounds(newRounds)

      if (sessionId) {
        await supabase
          .from('ai_chat_sessions')
          .update({ rounds_used: newRounds })
          .eq('id', sessionId)
      }
    }, 1500 + Math.random() * 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const remainingRounds = MAX_ROUNDS - sessionRounds

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full mb-4">
              <MessageCircle className="w-5 h-5 text-indigo-600" />
              <span className="text-indigo-700 text-sm font-medium">AI Spiritual Wellness Chat</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-3">
              24-Hour AI Spiritual & Wellness Guidance Chat
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Get professional guidance for relationship, career, health and life confusion anytime. 
              AI remembers your conversation context for continuous deep analysis.
            </p>
          </div>

          {!sessionStarted ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Start a Chat Session</h2>
                  <p className="text-slate-500">One session includes 5 full dialogue rounds</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">24/7 Unlimited Service</p>
                      <p className="text-sm text-slate-500">Anytime, anywhere guidance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Full Context Memory</p>
                      <p className="text-sm text-slate-500">AI remembers your conversation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Multi-Domain Guidance</p>
                      <p className="text-sm text-slate-500">Love, career, family, mental health</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-slate-600">Session Price</span>
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <span className="text-2xl font-bold text-slate-800">{SESSION_COST}</span>
                      <span className="text-slate-500">Coins</span>
                    </div>
                  </div>

                  <button
                    onClick={startSession}
                    disabled={points < SESSION_COST}
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {points < SESSION_COST ? 'Not Enough Coins' : 'Start Chat Session'}
                  </button>

                  <p className="text-center text-sm text-slate-400 mt-4">
                    Your balance: {points.toLocaleString()} Coins
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[600px] flex flex-col">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white">AI Wellness Guide</p>
                    <p className="text-xs text-indigo-100">Always here to listen</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full">
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-medium">
                    {remainingRounds} / {MAX_ROUNDS} rounds
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${message.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md'
                        : 'bg-white text-slate-700 shadow-sm rounded-bl-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-end gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {sessionRounds >= MAX_ROUNDS ? (
                <div className="px-6 py-4 bg-amber-50 border-t border-amber-100 text-center">
                  <p className="text-amber-700 font-medium">
                    Session complete! This chat session has used all {MAX_ROUNDS} rounds.
                  </p>
                  <p className="text-sm text-amber-600 mt-1">
                    Start a new session to continue your journey
                  </p>
                </div>
              ) : (
                <div className="px-4 py-4 border-t border-slate-100 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tell me your current confusion about relationship, career, life or mental state..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700 placeholder-slate-400"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-12 max-w-2xl mx-auto text-center">
            <p className="text-slate-400 text-sm">
              All analysis content is based on traditional folk culture and modern spiritual wellness guidance. 
              All services are for entertainment and personal reflection only. 
              It does not constitute medical, legal, investment or life prediction advice.
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
