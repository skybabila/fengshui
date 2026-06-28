'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate, getTodayString } from '@/lib/utils'
import { Star, Calendar, Sparkles, ArrowRight, Sun, Moon, Mountain, Droplets, Leaf, Flame, Gem } from 'lucide-react'

const fortuneTypes = [
  { type: 'Excellent', emoji: '🌟', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-100', textColor: 'text-green-600' },
  { type: 'Good', emoji: '✨', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
  { type: 'Normal', emoji: '🌤️', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
  { type: 'Challenging', emoji: '⛅', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
]

const zodiacSigns = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
const zodiacElements = ['Water', 'Earth', 'Wood', 'Wood', 'Earth', 'Fire', 'Fire', 'Earth', 'Metal', 'Metal', 'Earth', 'Water']

const elementIcons: Record<string, any> = {
  Wood: Leaf,
  Fire: Flame,
  Earth: Mountain,
  Metal: Gem,
  Water: Droplets,
}

function getZodiacSign(year: number): string {
  const index = (year - 4) % 12
  return zodiacSigns[index]
}

function getZodiacElement(year: number): string {
  const index = (year - 4) % 12
  return zodiacElements[index]
}

const fortuneDescriptions: Record<string, string[]> = {
  Excellent: [
    'Today brings great fortune! Opportunities will come your way. Seize them with confidence.',
    'Excellent energy surrounds you today. Your efforts will be rewarded abundantly.',
    'Fortune smiles upon you! Today is perfect for new beginnings and important decisions.',
    'The stars align in your favor! Big opportunities are coming your way. Stay ready.',
    'Today is a golden day! Your luck is at its peak - take bold action.',
    'Divine blessings flow to you today. Everything you touch turns to gold.',
    'Good fortune awaits! Your hard work pays off - expect pleasant surprises.',
    'Today shines brightly! Positive vibes attract great opportunities.',
    'Your lucky day has arrived! Doors open easily, success comes naturally.',
    'The universe is conspiring in your favor. Dreams come true today!',
    'Auspicious energy fills the air. Today is your day to shine!',
    'Fortune favors the bold! Today brings unexpected good news.',
  ],
  Good: [
    'A good day lies ahead. Positive energy flows in your favor.',
    'Today brings favorable outcomes. Trust your instincts and move forward.',
    'Good fortune is with you. Take action and make progress.',
    'Today is smooth sailing! Things work out better than expected.',
    'Positive vibes surround you. Today is perfect for making connections.',
    'Good luck follows you. Small wins add up to big success.',
    'A pleasant day awaits. Enjoy the little joys and savor the moments.',
    'Today brings harmony and balance. Relationships thrive.',
    'You are on the right track. Keep going, good things are happening.',
    'Today feels light and easy. Opportunities knock softly.',
    'Gentle fortune smiles. Today is about growth and learning.',
    'Small blessings accumulate. Today is filled with goodness.',
  ],
  Normal: [
    'A balanced day. Focus on maintaining harmony in all areas of life.',
    'Today is neutral - neither great nor challenging. Use it for reflection.',
    'Steady energy today. Focus on small, meaningful steps.',
    'Today is about consistency. Keep doing what works.',
    'A calm, steady day. Use this time to recharge and prepare.',
    'Neutral energy surrounds you. Today is for planning, not rushing.',
    'Balance is key. Avoid extremes, stay centered.',
    'Today is uneventful - in a good way. Enjoy the peace.',
    'Steady progress today. Small steps lead to big results.',
    'A quiet day for inner work. Reflect, plan, and prepare.',
    'Today flows smoothly. No big surprises, just steady energy.',
    'Maintain your rhythm. Today rewards consistency.',
  ],
  Challenging: [
    'Today may present challenges. Stay grounded and trust your inner strength.',
    'Challenges come to teach and strengthen you. Face them with courage.',
    'A testing day, but you have the wisdom to overcome obstacles.',
    'Today tests your resilience. Trust that you are stronger than you know.',
    'Challenging times build character. You have what it takes.',
    'Today requires patience. Take things step by step.',
    'Obstacles appear, but they are temporary. Stay focused.',
    'A day of learning. Challenges reveal new paths.',
    'You face resistance today, but it makes you grow.',
    'Today may feel heavy, but your spirit is lighter.',
    'Stay calm, stay centered. Challenges pass quickly.',
    'You have the strength within. Today is about perseverance.',
  ],
}

const elementAdvice: Record<string, { advice: string[]; lucky: string[]; caution: string[] }> = {
  Wood: {
    advice: [
      'Today is a good day for growth and new beginnings.',
      'Embrace change and new opportunities. Growth is in the air.',
      'Plant seeds today - they will grow into something wonderful.',
      'Nurture your ideas and watch them blossom.',
      'New beginnings are favored. Start something fresh.',
    ],
    lucky: [
      'Green colors, plants, outdoor activities',
      'Nature walks, gardening, fresh starts',
      'New projects, learning, growth',
      'Connecting with nature, spring energy',
    ],
    caution: [
      'Avoid rushing decisions',
      'Don\'t overextend yourself',
      'Avoid being too impulsive',
      'Don\'t force growth - let it happen naturally',
    ],
  },
  Fire: {
    advice: [
      'Passion and energy are high today.',
      'Channel your energy into creative pursuits.',
      'Your enthusiasm is contagious - share it!',
      'Follow your heart and ignite your passions.',
      'Today is hot with creative energy.',
    ],
    lucky: [
      'Red colors, social gatherings, creativity',
      'Art, music, expressing yourself',
      'Bold actions, taking the lead',
      'Sunlight, warmth, celebration',
    ],
    caution: [
      'Avoid arguments and conflicts',
      'Don\'t burn bridges',
      'Stay calm when tempers rise',
      'Avoid being too aggressive',
    ],
  },
  Earth: {
    advice: [
      'Stability and grounding are emphasized.',
      'Focus on your foundation. Build something lasting.',
      'Today is about roots and security.',
      'Ground yourself in what matters most.',
      'Nurture your home and family.',
    ],
    lucky: [
      'Yellow colors, nature walks, meditation',
      'Home improvement, gardening',
      'Stability, routine, comfort',
      'Earth tones, grounding activities',
    ],
    caution: [
      'Avoid being too rigid',
      'Don\'t resist change',
      'Avoid stubbornness',
      'Don\'t get stuck in old patterns',
    ],
  },
  Metal: {
    advice: [
      'Clarity and precision are key today.',
      'Sharpen your focus and cut through confusion.',
      'Today favors logic and reason.',
      'Get organized and streamline your life.',
      'Metal energy brings clarity and strength.',
    ],
    lucky: [
      'White colors, organization, focus',
      'Planning, strategizing, precision',
      'Metal accessories, clean spaces',
      'Decision-making, clarity',
    ],
    caution: [
      'Avoid being overly critical',
      'Don\'t cut yourself off from emotions',
      'Avoid being too rigid',
      'Don\'t be cold or detached',
    ],
  },
  Water: {
    advice: [
      'Flow and adaptability are favored.',
      'Go with the flow - flexibility brings success.',
      'Today is about emotions and intuition.',
      'Let things unfold naturally.',
      'Water energy washes away obstacles.',
    ],
    lucky: [
      'Blue colors, water activities, reflection',
      'Intuition, emotions, healing',
      'Flowing with change, adaptability',
      'Water features, meditation',
    ],
    caution: [
      'Avoid being too passive',
      'Don\'t let emotions overwhelm you',
      'Avoid being scattered',
      'Don\'t drift aimlessly',
    ],
  },
}

const dailyGuidanceMessages: Record<string, string[]> = {
  Excellent: [
    'Today is your lucky day! Wear lucky colors and follow your intuition.',
    'Great opportunities are knocking - answer the door!',
    'Your energy is magnetic. People are drawn to you today.',
    'Take bold action - the universe supports you.',
    'Today is perfect for important meetings and decisions.',
  ],
  Good: [
    'Stay positive and keep moving forward. Good things are happening.',
    'Today favors collaboration - work with others.',
    'Your efforts are noticed and appreciated.',
    'Small steps today lead to big results tomorrow.',
    'Trust the process - everything is unfolding as it should.',
  ],
  Normal: [
    'Take time to reflect. Today is about inner growth.',
    'Focus on self-care and recharge your batteries.',
    'Organize your space - clarity brings peace.',
    'Today is for planning, not for executing.',
    'Be gentle with yourself. Balance is key.',
  ],
  Challenging: [
    'Today tests your patience. Breathe deeply and stay calm.',
    'Ask for help if you need it - you don\'t have to do it alone.',
    'Focus on what you can control. Let go of the rest.',
    'Challenges are opportunities in disguise.',
    'Trust your instincts - they will guide you through.',
  ],
}

export default function DailyFortunePage() {
  const [fortune, setFortune] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          return
        }
        setUser(authUser)

        const userProfile = await getUserProfile(authUser.id)
        setProfile(userProfile)

        const { data: existing } = await supabase
          .from('daily_fortunes')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('date', getTodayString())
          .single()
        
        if (existing) {
          setFortune(existing)
          setShowResult(true)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const generateFortune = async () => {
    if (!user) {
      alert('Please sign in to get your daily fortune')
      return
    }

    setGenerating(true)

    try {
      const today = getTodayString()
      const year = new Date().getFullYear()
      const zodiac = getZodiacSign(year)
      const element = getZodiacElement(year)
      
      const randomIndex = Math.floor(Math.random() * fortuneTypes.length)
      const selectedFortune = fortuneTypes[randomIndex]

      const descIndex = Math.floor(Math.random() * fortuneDescriptions[selectedFortune.type].length)
      const description = fortuneDescriptions[selectedFortune.type][descIndex]

      const adviceIndex = Math.floor(Math.random() * elementAdvice[element].advice.length)
      const luckyIndex = Math.floor(Math.random() * elementAdvice[element].lucky.length)
      const cautionIndex = Math.floor(Math.random() * elementAdvice[element].caution.length)

      const guidanceIndex = Math.floor(Math.random() * dailyGuidanceMessages[selectedFortune.type].length)

      const { data: newFortune, error } = await supabase
        .from('daily_fortunes')
        .insert({
          user_id: user.id,
          date: today,
          fortune_type: selectedFortune.type,
          description,
          zodiac_sign: zodiac,
          element,
          advice: elementAdvice[element].advice[adviceIndex],
          lucky_items: elementAdvice[element].lucky[luckyIndex],
          caution_items: elementAdvice[element].caution[cautionIndex],
          guidance: dailyGuidanceMessages[selectedFortune.type][guidanceIndex],
        })
        .select()
        .single()

      if (error) throw error

      setFortune(newFortune)
      setShowResult(true)
    } catch (error) {
      console.error('Error generating fortune:', error)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-2xl">🌟</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
        </div>
      </div>
    )
  }

  const currentFortune = fortuneTypes.find(f => f.type === fortune?.fortune_type)
  const ElementIcon = elementIcons[fortune?.element] || Sparkles

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Daily Fortune</h1>
          <p className="text-stone-500">Discover your fortune for today</p>
        </div>

        {showResult && fortune ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
            <div className={`bg-gradient-to-r ${currentFortune?.color} p-8 text-center text-white`}>
              <div className="text-6xl mb-4">{currentFortune?.emoji}</div>
              <h2 className="text-2xl font-bold mb-2">{fortune.fortune_type}</h2>
              <div className="flex items-center justify-center gap-2 text-white/80">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(new Date())}</span>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-stone-600 leading-relaxed text-lg">{fortune.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-stone-500 mb-1">Zodiac Sign</p>
                  <p className="font-semibold text-stone-800">{fortune.zodiac_sign}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-stone-500 mb-1">Element</p>
                  <p className="font-semibold text-stone-800 flex items-center justify-center gap-2">
                    {ElementIcon && <ElementIcon className="w-4 h-4" />}
                    {fortune.element}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-emerald-700">Today&apos;s Guidance</h3>
                </div>
                <p className="text-stone-600 mb-4">{fortune.guidance || dailyGuidanceMessages[fortune.fortune_type]?.[0]}</p>
                
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-stone-500 mb-1">✨ Advice</p>
                    <p className="text-sm text-stone-700">{fortune.advice || elementAdvice[fortune.element]?.advice[0]}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 mb-1">✅ Lucky</p>
                    <p className="text-sm text-green-700">{fortune.lucky_items || elementAdvice[fortune.element]?.lucky[0]}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-600 mb-1">⚠️ Caution</p>
                    <p className="text-sm text-orange-700">{fortune.caution_items || elementAdvice[fortune.element]?.caution[0]}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={generateFortune}
                disabled={generating}
                className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Refresh Fortune'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">What does today hold?</h2>
            <p className="text-stone-500 mb-8">
              Discover your daily fortune based on ancient Chinese wisdom and your zodiac sign.
            </p>
            <button
              onClick={generateFortune}
              disabled={generating}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 transition-all hover:-translate-y-1 disabled:opacity-50"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Generating...
                </span>
              ) : (
                <>Get My Fortune <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
            {!user && (
              <p className="mt-4 text-sm text-stone-400">
                <a href="/login" className="text-emerald-600 hover:underline">Sign in</a> to save your fortune history
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
