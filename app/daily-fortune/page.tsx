'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate, getTodayString } from '@/lib/utils'
import { Star, Calendar, Sparkles, ArrowRight } from 'lucide-react'

const fortuneTypes = [
  { type: 'Excellent', emoji: '🌟', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-100', textColor: 'text-green-600' },
  { type: 'Good', emoji: '✨', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
  { type: 'Normal', emoji: '🌤️', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
  { type: 'Challenging', emoji: '⛅', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
]

const elementAdvice: Record<string, { advice: string; lucky: string; caution: string }> = {
  Wood: { advice: 'Today is a good day for growth and new beginnings.', lucky: 'Green colors, plants, outdoor activities', caution: 'Avoid rushing decisions' },
  Fire: { advice: 'Passion and energy are high today.', lucky: 'Red colors, social gatherings, creativity', caution: 'Avoid arguments and conflicts' },
  Earth: { advice: 'Stability and grounding are emphasized.', lucky: 'Yellow colors, nature walks, meditation', caution: 'Avoid being too rigid' },
  Metal: { advice: 'Clarity and precision are key today.', lucky: 'White colors, organization, focus', caution: 'Avoid being overly critical' },
  Water: { advice: 'Flow and adaptability are favored.', lucky: 'Blue colors, water activities, reflection', caution: 'Avoid being too passive' },
}

const zodiacSigns = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
const zodiacElements = ['Water', 'Earth', 'Wood', 'Wood', 'Earth', 'Fire', 'Fire', 'Earth', 'Metal', 'Metal', 'Earth', 'Water']

function getZodiacSign(year: number): string {
  const index = (year - 4) % 12
  return zodiacSigns[index]
}

function getZodiacElement(year: number): string {
  const index = (year - 4) % 12
  return zodiacElements[index]
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

      const descriptions: Record<string, string[]> = {
        Excellent: [
          'Today brings great fortune! Opportunities will come your way. Seize them with confidence.',
          'Excellent energy surrounds you today. Your efforts will be rewarded abundantly.',
          'Fortune smiles upon you! Today is perfect for new beginnings and important decisions.',
        ],
        Good: [
          'A good day lies ahead. Positive energy flows in your favor.',
          'Today brings favorable outcomes. Trust your instincts and move forward.',
          'Good fortune is with you. Take action and make progress.',
        ],
        Normal: [
          'A balanced day. Focus on maintaining harmony in all areas of life.',
          'Today is neutral - neither great nor challenging. Use it for reflection.',
          'Steady energy today. Focus on small, meaningful steps.',
        ],
        Challenging: [
          'Today may present challenges. Stay grounded and trust your inner strength.',
          'Challenges come to teach and strengthen you. Face them with courage.',
          'A testing day, but you have the wisdom to overcome obstacles.',
        ],
      }

      const descIndex = Math.floor(Math.random() * descriptions[selectedFortune.type].length)
      const description = descriptions[selectedFortune.type][descIndex]

      const { data: newFortune, error } = await supabase
        .from('daily_fortunes')
        .insert({
          user_id: user.id,
          date: today,
          fortune_type: selectedFortune.type,
          description,
          zodiac_sign: zodiac,
          element,
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
                  <p className="font-semibold text-stone-800">{fortune.element}</p>
                </div>
              </div>

              {elementAdvice[fortune.element] && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4">
                  <h3 className="font-semibold text-emerald-700 mb-3">Today&apos;s Guidance</h3>
                  <p className="text-stone-600 text-sm mb-3"><strong>Advice:</strong> {elementAdvice[fortune.element].advice}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                      ✅ {elementAdvice[fortune.element].lucky}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs">
                      ⚠️ {elementAdvice[fortune.element].caution}
                    </span>
                  </div>
                </div>
              )}

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
