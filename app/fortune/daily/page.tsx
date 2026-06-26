'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate, getTodayString } from '@/lib/utils'
import { Star, Calendar, Sparkles, Coins, ArrowRight, Clock, Sun, Moon, CalendarDays } from 'lucide-react'

const DAILY_COST = 5

const fortuneTypes = [
  { type: 'Great Fortune', emoji: '🌟', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-100', textColor: 'text-green-600' },
  { type: 'Good Fortune', emoji: '✨', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
  { type: 'Moderate Fortune', emoji: '🌤️', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
  { type: 'Small Fortune', emoji: '⛅', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  { type: 'Average', emoji: '☁️', color: 'from-gray-500 to-slate-500', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
]

const elementAdvice: Record<string, { advice: string; lucky: string; caution: string }> = {
  Wood: { advice: 'A day for growth and new beginnings. Seize the opportunities.', lucky: 'Green, plants, outdoor activities', caution: 'Avoid impulsive decisions' },
  Fire: { advice: 'Passion and energy are high. Great for socializing and creative pursuits.', lucky: 'Red, gatherings, artistic creation', caution: 'Avoid arguments and conflicts' },
  Earth: { advice: 'Stability and groundedness are the themes. Good for important matters.', lucky: 'Yellow, nature walks, meditation', caution: 'Avoid being too stubborn' },
  Metal: { advice: 'Clarity and precision are key. Good for planning and organization.', lucky: 'White, tidying up, focused work', caution: 'Avoid being overly critical' },
  Water: { advice: 'Flow and adaptability are your strengths. Be flexible.', lucky: 'Blue, water activities, reflection', caution: 'Avoid being too passive' },
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

const fortuneNavItems = [
  { id: 'daily', name: 'Daily Fortune', emoji: '☀️', icon: Sun, href: '/fortune/daily', cost: 5 },
  { id: 'weekly', name: 'Weekly Fortune', emoji: '🌙', icon: Moon, href: '/fortune/weekly', cost: 20 },
  { id: 'monthly', name: 'Monthly Fortune', emoji: '🌟', icon: CalendarDays, href: '/fortune/monthly', cost: 50 },
]

export default function DailyFortunePage() {
  const [fortune, setFortune] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)
  const [hasTodayFortune, setHasTodayFortune] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          window.location.href = '/login'
          return
        }
        setUser(authUser)

        const userProfile = await getUserProfile(authUser.id)
        setProfile(userProfile)

        const { data: existing, error } = await supabase
          .from('daily_fortunes')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('fortune_period', 'daily')
          .eq('date', getTodayString())
          .single()
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching fortune:', error)
          setErrorMsg('Failed to load fortune data. Please try again.')
        } else if (existing) {
          setFortune(existing)
          setShowResult(true)
          setHasTodayFortune(true)
        }
      } catch (error: any) {
        console.error('Error fetching data:', error)
        setErrorMsg('An error occurred. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const generateFortune = async () => {
    if (!user) {
      alert('Please log in to get your fortune')
      return
    }

    const points = profile?.points || 0
    if (points < DAILY_COST) {
      alert(`Not enough coins! Daily fortune costs ${DAILY_COST} coins, you have ${points} coins`)
      return
    }

    if (hasTodayFortune) {
      alert('You have already gotten your fortune today, come back tomorrow!')
      return
    }

    setGenerating(true)

    try {
      await supabase
        .from('user_profiles')
        .update({ points: points - DAILY_COST })
        .eq('id', user.id)

      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          description: 'Daily fortune cost',
          points: -DAILY_COST
        })

      const today = getTodayString()
      const year = new Date().getFullYear()
      const zodiac = getZodiacSign(year)
      const element = getZodiacElement(year)
      
      const randomIndex = Math.floor(Math.random() * fortuneTypes.length)
      const selectedFortune = fortuneTypes[randomIndex]

      const descriptions: Record<string, string[]> = {
        'Great Fortune': [
          'Excellent fortune today! Everything goes smoothly with noble people helping you. Perfect time for new plans.',
          'A day of great fortune! Abundant energy and opportunities. Seize the moment and you will succeed.',
          'Superb fortune! Your wishes come true with half the effort. Actions today will bear fruit.',
        ],
        'Good Fortune': [
          'Good fortune, everything goes well. Stay positive and good luck will follow.',
          'Good luck is upon you. Good time for important matters. Steady progress brings rewards.',
          'Auspicious day for socializing and cooperation. Good connections and positive events are coming.',
        ],
        'Moderate Fortune': [
          'Steady and improving fortune. Take things step by step. Stay focused and move forward steadily.',
          'Moderate fortune, good for daily affairs. Be patient and consistent.',
          'Slightly above average fortune. Not advisable to take risks. Solid progress leads to better days.',
        ],
        'Small Fortune': [
          'Decent fortune with minor ups and downs. Proceed with caution and turn dangers into safety.',
          'A small fortune day. Better to defend than attack. Keep a low profile and wait for the right time.',
          'Stable fortune, pay attention to details. Be careful and you will get through safely.',
        ],
        'Average': [
          'Plain fortune. Better to stay still than move. Cultivate yourself and wait for a turning point.',
          'A steady day, good for rest and adjustment. Not suitable for major moves.',
          'Average fortune. Keep a calm mind. Let things take their course and wait for tomorrow.',
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
          fortune_period: 'daily',
        })
        .select()
        .single()

      if (error) throw error

      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)

      setFortune(newFortune)
      setShowResult(true)
      setHasTodayFortune(true)
    } catch (error: any) {
      console.error('Error generating fortune:', error)
      alert('Failed to generate fortune, please try again later')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-2xl">☀️</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
        </div>
      </div>
    )
  }

  const currentFortune = fortuneTypes.find(f => f.type === fortune?.fortune_type)
  const points = profile?.points || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="flex">
        {/* Left Sidebar Menu */}
        <div className="w-72 min-h-screen bg-white border-r border-stone-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-800">Fortune Center</h1>
              <p className="text-xs text-stone-500">Explore your destiny</p>
            </div>
          </div>

          {/* Coins Display */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">My Coins</p>
                <p className="text-xl font-bold text-amber-600">{points}</p>
              </div>
            </div>
            <Link
              href="/user/points"
              className="mt-3 block text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2 bg-white rounded-lg"
            >
              View History →
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-2">
            {fortuneNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    item.id === 'daily'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'bg-amber-50 hover:bg-amber-100 border border-transparent hover:border-amber-300'
                  }`}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-semibold ${item.id === 'daily' ? 'text-white' : 'text-stone-800'}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs ${item.id === 'daily' ? 'text-white/80' : 'text-stone-500'}`}>
                      {item.cost} coins
                    </p>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Fortune Guide */}
          <div className="mt-6 pt-6 border-t border-stone-100">
            <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Daily Fortune
            </h3>
            <div className="space-y-2 text-xs text-stone-500">
              <p>• Quick daily overview</p>
              <p>• Lucky directions & colors</p>
              <p>• Element guidance</p>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                {errorMsg}
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg mb-4">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-stone-800 mb-2">Daily Fortune</h1>
              <p className="text-stone-500">{formatDate(new Date())}</p>
            </div>

            {/* Coins Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">My Coins</p>
                  <p className="text-xl font-bold text-amber-600">{points}</p>
                </div>
              </div>
              <div className="text-sm text-stone-500">
                Cost: <span className="text-amber-600 font-semibold">{DAILY_COST} coins</span>
              </div>
            </div>

            {/* Fortune Result */}
            {showResult && fortune ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className={`bg-gradient-to-r ${currentFortune?.color} p-8 text-center text-white`}>
                  <div className="text-6xl mb-4">{currentFortune?.emoji}</div>
                  <h2 className="text-3xl font-bold mb-2">{fortune.fortune_type}</h2>
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
                      <p className="text-sm text-stone-500 mb-1">Zodiac</p>
                      <p className="font-bold text-stone-800 text-lg">{fortune.zodiac_sign}</p>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-stone-500 mb-1">Element</p>
                      <p className="font-bold text-stone-800 text-lg">{fortune.element}</p>
                    </div>
                  </div>

                  {elementAdvice[fortune.element] && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 mb-6">
                      <h3 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Guidance for Today
                      </h3>
                      <p className="text-stone-600 text-sm mb-3">{elementAdvice[fortune.element].advice}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          ✅ {elementAdvice[fortune.element].lucky}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                          ⚠️ {elementAdvice[fortune.element].caution}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-amber-700 font-medium">You have already gotten your fortune today</p>
                    <p className="text-sm text-amber-600">Come back tomorrow for a new fortune reading!</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sun className="w-12 h-12 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 mb-2">How is your fortune today?</h2>
                <p className="text-stone-500 mb-6">
                  Spend {DAILY_COST} coins to get your personalized daily fortune reading
                </p>
                
                {points < DAILY_COST && (
                  <div className="bg-red-50 rounded-xl p-4 mb-6">
                    <p className="text-red-600">
                      Not enough coins! You need {DAILY_COST} coins, you have {points} coins
                    </p>
                  </div>
                )}

                <button
                  onClick={generateFortune}
                  disabled={generating || points < DAILY_COST}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 transition-all hover:-translate-y-1 disabled:opacity-50"
                >
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Calculating...
                    </span>
                  ) : (
                    <>Get Fortune ({DAILY_COST} coins) <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>

                <p className="mt-4 text-xs text-stone-400">
                  You can only get one fortune per day
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
