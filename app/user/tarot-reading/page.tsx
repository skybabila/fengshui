'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import SidebarLayout from '@/components/SidebarLayout'
import { Sparkles, Moon, Star, Clock, Coins, RefreshCw, AlertCircle } from 'lucide-react'

const tarotCards = [
  { name: 'The Fool', meaning: 'New beginnings, innocence, spontaneity', image: '🃏' },
  { name: 'The Magician', meaning: 'Manifestation, resourcefulness, power', image: '✨' },
  { name: 'The High Priestess', meaning: 'Intuition, sacred knowledge, divine feminine', image: '🌙' },
  { name: 'The Empress', meaning: 'Femininity, beauty, nature, abundance', image: '👑' },
  { name: 'The Emperor', meaning: 'Authority, establishment, structure', image: '🏛️' },
  { name: 'The Hierophant', meaning: 'Spiritual wisdom, religious beliefs', image: '📿' },
  { name: 'The Lovers', meaning: 'Love, harmony, relationships, values', image: '💕' },
  { name: 'The Chariot', meaning: 'Control, willpower, success, action', image: '🏆' },
  { name: 'Strength', meaning: 'Strength, courage, persuasion, influence', image: '🦁' },
  { name: 'The Hermit', meaning: 'Soul-searching, introspection, guidance', image: '🏔️' },
  { name: 'Wheel of Fortune', meaning: 'Good luck, karma, life cycles', image: '🎡' },
  { name: 'Justice', meaning: 'Justice, fairness, truth, cause and effect', image: '⚖️' },
  { name: 'The Hanged Man', meaning: 'Pause, surrender, letting go', image: '💫' },
  { name: 'Death', meaning: 'Endings, change, transformation, transition', image: '🌅' },
  { name: 'Temperance', meaning: 'Balance, moderation, patience, purpose', image: '🌈' },
  { name: 'The Devil', meaning: 'Shadow self, attachment, addiction', image: '🔮' },
  { name: 'The Tower', meaning: 'Sudden change, upheaval, chaos, revelation', image: '⚡' },
  { name: 'The Star', meaning: 'Hope, faith, purpose, renewal', image: '⭐' },
  { name: 'The Moon', meaning: 'Illusion, fear, anxiety, intuition', image: '🌕' },
  { name: 'The Sun', meaning: 'Positivity, fun, warmth, success', image: '☀️' },
  { name: 'Judgement', meaning: 'Judgement, rebirth, inner calling', image: '📯' },
  { name: 'The World', meaning: 'Completion, integration, accomplishment', image: '🌍' },
]

const singleCardInterpretations = [
  'This card reflects that your current energy is gradually stabilizing. Your recent confusion will slowly clear up as you adjust your mindset.',
  'Your inner intuition is accurate right now. Trust your own judgment and avoid overthinking small matters.',
  'A gentle turning point is approaching. Keep steady pace, and your situation will improve naturally.',
  'You are in a stage of energy accumulation. Patience now will bring better development later.',
  'The energies around you are shifting in a positive direction. Stay open to new opportunities.',
  'Your subconscious is sending you important signals. Pay attention to your dreams and gut feelings.',
  'A period of growth and learning is ahead. Embrace the lessons that come your way.',
  'Balance is being restored in your life. Trust the process and remain patient.',
]

const spreads = [
  {
    id: 'single',
    name: 'Single Card Quick Answer',
    price: 15,
    dailyLimit: 3,
    description: 'Get a direct single-card symbolic answer for your current question and energy state.',
    useCase: 'Quick yes/no, daily energy, simple doubts',
    cardCount: 1,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'three',
    name: 'Three-Card Timeline Spread',
    price: 25,
    dailyLimit: 2,
    description: 'Analyze how past energy influences your current situation and what gentle trends will unfold in the future.',
    useCase: 'Relationship development, job trends, life changes',
    cardCount: 3,
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'celtic',
    name: 'Celtic Cross Full Life Spread',
    price: 40,
    dailyLimit: 1,
    description: 'The most classic 10-card tarot system. Reveals hidden energy, external influences, inner emotions, challenges and final outcome trends.',
    useCase: 'Major life decisions, full situation analysis, hidden factors',
    cardCount: 10,
    color: 'from-amber-500 to-orange-600',
  },
]

export default function TarotReadingPage() {
  const [user, setUser] = useState<any>(null)
  const [points, setPoints] = useState(0)
  const [selectedSpread, setSelectedSpread] = useState<any>(null)
  const [drawnCards, setDrawnCards] = useState<any[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)
  const [interpretation, setInterpretation] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [todayUsage, setTodayUsage] = useState<Record<string, number>>({})

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const profile = await getUserProfile(user.id)
        setPoints(profile?.points || 0)
        loadTodayUsage(user.id)
      }
    }
    loadUser()
  }, [])

  const loadTodayUsage = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('tarot_readings')
      .select('spread_type, created_at')
      .eq('user_id', userId)
      .gte('created_at', today + 'T00:00:00')
    
    if (data) {
      const usage: Record<string, number> = {}
      data.forEach(r => {
        usage[r.spread_type] = (usage[r.spread_type] || 0) + 1
      })
      setTodayUsage(usage)
    }
  }

  const getRandomCards = (count: number) => {
    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  const handleDraw = async () => {
    if (!selectedSpread || !user) return

    const usage = todayUsage[selectedSpread.id] || 0
    if (usage >= selectedSpread.dailyLimit) {
      alert(`Daily limit reached for ${selectedSpread.name}. Try again tomorrow!`)
      return
    }

    if (points < selectedSpread.price) {
      alert('Not enough coins!')
      return
    }

    setIsDrawing(true)
    setDrawnCards([])
    setFlippedCards([])
    setShowResult(false)
    setInterpretation('')

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: points - selectedSpread.price })
        .eq('id', user.id)
      
      if (updateError) throw updateError
      setPoints(prev => prev - selectedSpread.price)

      const cards = getRandomCards(selectedSpread.cardCount)
      setDrawnCards(cards)

      const { error: insertError } = await supabase
        .from('tarot_readings')
        .insert({
          user_id: user.id,
          spread_type: selectedSpread.id,
          cards: cards.map(c => c.name),
          coins_spent: selectedSpread.price,
        })
      
      if (insertError) throw insertError

      setTodayUsage(prev => ({
        ...prev,
        [selectedSpread.id]: (prev[selectedSpread.id] || 0) + 1
      }))

      cards.forEach((_, index) => {
        setTimeout(() => {
          setFlippedCards(prev => [...prev, index])
        }, 400 + index * 600)
      })

      setTimeout(() => {
        generateInterpretation(cards, selectedSpread.id)
        setShowResult(true)
      }, 400 + cards.length * 600 + 500)

    } catch (err) {
      alert('Failed to draw cards. Please try again.')
    } finally {
      setIsDrawing(false)
    }
  }

  const generateInterpretation = (cards: any[], spreadId: string) => {
    if (spreadId === 'single') {
      const random = singleCardInterpretations[Math.floor(Math.random() * singleCardInterpretations.length)]
      setInterpretation(random)
    } else if (spreadId === 'three') {
      setInterpretation(
        `**Past Energy:**\n${cards[0]?.name} - ${cards[0]?.meaning}\n\nYour previous experience has shaped your current mindset. Some emotions or choices are still subtly influencing you now. The energy of ${cards[0]?.name} carries lessons that continue to resonate in your life.\n\n` +
        `**Present State:**\n${cards[1]?.name} - ${cards[1]?.meaning}\n\nYour current energy is in a transition period. You may feel confused or hesitant, but your overall state is gradually improving. ${cards[1]?.name} suggests you are exactly where you need to be for growth.\n\n` +
        `**Future Trend Guidance:**\n${cards[2]?.name} - ${cards[2]?.meaning}\n\nIf you maintain a stable attitude, the situation will become smoother. Avoid impulsive decisions, and you will see positive progress soon. ${cards[2]?.name} points toward gentle unfolding and natural progression.`
      )
    } else if (spreadId === 'celtic') {
      setInterpretation(
        `**1. Core Situation Analysis**\n${cards[0]?.name} - ${cards[0]?.meaning}\n\nThis card represents the heart of your current situation, the central energy that surrounds your question.\n\n` +
        `**2. Inner Emotion & Hidden Pressure**\n${cards[1]?.name} - ${cards[1]?.meaning}\n\nWhat lies beneath the surface—your subconscious feelings, fears, and hopes that may not yet be fully conscious.\n\n` +
        `**3. External Environment & People Influence**\n${cards[2]?.name} - ${cards[2]?.meaning}\n\nThe energies and people around you that are influencing the situation from the outside.\n\n` +
        `**4. Challenges You Need to Face**\n${cards[3]?.name} - ${cards[3]?.meaning}\n\nThe obstacles and growth edges that are currently calling for your attention and awareness.\n\n` +
        `**5. Best Attitude & Suggested Action**\n${cards[4]?.name} - ${cards[4]?.meaning}\n\nThe approach and mindset that will most help you navigate this situation with grace.\n\n` +
        `**6. Long-Term Energy Trend Guidance**\n${cards[5]?.name} - ${cards[5]?.meaning}\n\nThe overall direction your energy is flowing toward, if you continue on your current path.`
      )
    }
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full mb-4">
              <Moon className="w-5 h-5 text-purple-300" />
              <span className="text-purple-200 text-sm font-medium">Tarot Energy Reading</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Multiple Classic Spreads & AI Deep Interpretation
            </h1>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto">
              Draw authentic tarot cards, experience smooth card flip animation, and receive professional AI analysis for love, career, life choices and inner energy trends.
            </p>
          </div>

          {!selectedSpread ? (
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {spreads.map((spread) => {
                const usage = todayUsage[spread.id] || 0
                const remaining = spread.dailyLimit - usage
                const canAfford = points >= spread.price
                const hasLimit = remaining > 0

                return (
                  <div
                    key={spread.id}
                    className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 transition-all cursor-pointer ${
                      !hasLimit ? 'opacity-50' : ''
                    }`}
                    onClick={() => hasLimit && canAfford && setSelectedSpread(spread)}
                  >
                    <div className={`absolute top-4 right-4 px-3 py-1 bg-gradient-to-r ${spread.color} rounded-full text-white text-xs font-bold`}>
                      {spread.cardCount} Cards
                    </div>
                    <div className={`w-14 h-14 bg-gradient-to-br ${spread.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{spread.name}</h3>
                    <p className="text-purple-200 text-sm mb-4">{spread.description}</p>
                    <div className="flex items-center gap-2 text-xs text-purple-300 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>Best for: {spread.useCase}</span>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-amber-400" />
                          <span className="text-2xl font-bold text-white">{spread.price}</span>
                          <span className="text-purple-300 text-sm">Coins</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-purple-300">
                            {remaining > 0 ? `${remaining} left today` : 'Used all today'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {!canAfford && hasLimit && (
                      <div className="mt-3 flex items-center gap-1 text-red-400 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        <span>Not enough coins</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div>
              <button
                onClick={() => {
                  setSelectedSpread(null)
                  setDrawnCards([])
                  setFlippedCards([])
                  setShowResult(false)
                  setInterpretation('')
                }}
                className="mb-6 flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Choose Another Spread
              </button>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedSpread.name}</h2>
                <p className="text-purple-200">
                  {selectedSpread.cardCount} cards · {selectedSpread.price} Coins
                </p>
              </div>

              {drawnCards.length === 0 ? (
                <div className="flex flex-col items-center">
                  <div
                    className={`relative w-48 h-72 cursor-pointer transition-transform hover:scale-105 ${
                      isDrawing ? 'animate-bounce' : ''
                    }`}
                    onClick={!isDrawing ? handleDraw : undefined}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900 rounded-2xl shadow-2xl border-4 border-purple-500/30 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🌙</div>
                        <div className="text-purple-200 font-bold text-lg">Tarot Deck</div>
                        <div className="text-purple-300 text-sm mt-2">Click to Draw</div>
                      </div>
                    </div>
                  </div>
                  {!isDrawing && (
                    <p className="mt-6 text-purple-300">Focus on your question and click the deck</p>
                  )}
                </div>
              ) : (
                <div>
                  <div className={`flex flex-wrap justify-center gap-4 mb-12 ${
                    selectedSpread.cardCount === 10 ? 'max-w-4xl mx-auto' : ''
                  }`}>
                    {drawnCards.map((card, index) => (
                      <div
                        key={index}
                        className="relative w-32 h-48 perspective-1000"
                        style={{ perspective: '1000px' }}
                      >
                        <div
                          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                            flippedCards.includes(index) ? 'rotate-y-180' : ''
                          }`}
                          style={{
                            transformStyle: 'preserve-3d',
                            transform: flippedCards.includes(index) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                          }}
                        >
                          <div
                            className="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900 rounded-xl shadow-xl border-2 border-purple-500/30 flex items-center justify-center"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <span className="text-4xl">🌙</span>
                          </div>
                          <div
                            className="absolute inset-0 bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-xl border-2 border-amber-200 flex flex-col items-center justify-center p-3"
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)',
                            }}
                          >
                            <div className="text-4xl mb-2">{card.image}</div>
                            <p className="text-sm font-bold text-slate-800 text-center">{card.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {showResult && (
                    <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 animate-fade-in">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <h3 className="text-xl font-bold text-white">AI Interpretation</h3>
                      </div>
                      <div className="text-purple-100 leading-relaxed whitespace-pre-wrap">
                        {interpretation}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-16 max-w-2xl mx-auto text-center">
            <p className="text-purple-300/60 text-sm">
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
