'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate, getTodayString, getWeekNumber, getYear } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Sparkles, Calendar, Star, Coins, ArrowRight, Clock, Moon } from 'lucide-react'

const WEEKLY_COST = 20

const fortuneTypes = [
  { type: 'Great Fortune', emoji: '🌟', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-100', textColor: 'text-green-600' },
  { type: 'Good Fortune', emoji: '✨', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
  { type: 'Moderate Fortune', emoji: '🌤️', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
  { type: 'Small Fortune', emoji: '⛅', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  { type: 'Average', emoji: '☁️', color: 'from-gray-500 to-slate-500', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
]

const weekAdvice: Record<string, { overview: string; focus: string; caution: string; luckyDays: string[] }> = {
  'Great Fortune': {
    overview: 'Excellent fortune this week! Everything goes smoothly with noble people helping you. Perfect time for new plans.',
    focus: 'Seize opportunities and act boldly. Great for launching new projects or making important decisions.',
    caution: 'Stay humble, don\'t be too showy.',
    luckyDays: ['Monday', 'Wednesday', 'Friday']
  },
  'Good Fortune': {
    overview: 'Good fortune, everything goes well. Stay positive and good luck will follow.',
    focus: 'Steady progress. Good for social activities and collaborative projects.',
    caution: 'Pay attention to details, avoid carelessness.',
    luckyDays: ['Tuesday', 'Thursday']
  },
  'Moderate Fortune': {
    overview: 'Steady and improving fortune. Take things step by step. Stay focused and move forward steadily.',
    focus: 'Follow the plan, not advisable to take risks.',
    caution: 'Be patient, don\'t rush for quick results.',
    luckyDays: ['Wednesday', 'Saturday']
  },
  'Small Fortune': {
    overview: 'Decent fortune with minor ups and downs. Proceed with caution and turn dangers into safety.',
    focus: 'Keep a low profile, focus on your core work.',
    caution: 'Avoid impulsive decisions, listen to others\' opinions.',
    luckyDays: ['Friday']
  },
  'Average': {
    overview: 'Plain fortune. Better to stay still than move. Cultivate yourself and wait for a turning point.',
    focus: 'Good for rest and adjustment, not suitable for major moves.',
    caution: 'Keep a calm mind, let things take their course.',
    luckyDays: ['Sunday']
  },
}

export default function WeeklyFortunePage() {
  const [fortune, setFortune] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)
  const [hasWeekFortune, setHasWeekFortune] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const pathname = usePathname()

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

        const currentWeek = getWeekNumber()
        const currentYear = getYear()

        const { data: existing, error } = await supabase
          .from('daily_fortunes')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('fortune_period', 'weekly')
          .eq('week_number', currentWeek)
          .eq('year', currentYear)
          .single()
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching fortune:', error)
          setErrorMsg('Failed to load fortune data. Please try again.')
        } else if (existing) {
          setFortune(existing)
          setShowResult(true)
          setHasWeekFortune(true)
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
    if (points < WEEKLY_COST) {
      alert(`Not enough coins! Weekly fortune costs ${WEEKLY_COST} coins, you have ${points} coins`)
      return
    }

    if (hasWeekFortune) {
      alert('You have already gotten your fortune this week, come back next week!')
      return
    }

    setGenerating(true)

    try {
      await supabase
        .from('user_profiles')
        .update({ points: points - WEEKLY_COST })
        .eq('id', user.id)

      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          description: 'Weekly fortune cost',
          points: -WEEKLY_COST
        })

      const currentWeek = getWeekNumber()
      const currentYear = getYear()
      
      const randomIndex = Math.floor(Math.random() * fortuneTypes.length)
      const selectedFortune = fortuneTypes[randomIndex]

      const advice = weekAdvice[selectedFortune.type]

      const { data: newFortune, error } = await supabase
        .from('daily_fortunes')
        .insert({
          user_id: user.id,
          date: getTodayString(),
          fortune_type: selectedFortune.type,
          description: advice.overview,
          fortune_period: 'weekly',
          week_number: currentWeek,
          year: currentYear,
        })
        .select()
        .single()

      if (error) throw error

      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)

      setFortune(newFortune)
      setShowResult(true)
      setHasWeekFortune(true)
    } catch (error: any) {
      console.error('Error generating fortune:', error)
      alert('Failed to generate fortune, please try again later')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <span className="text-2xl">🌙</span>
            </div>
            <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  const currentFortune = fortuneTypes.find(f => f.type === fortune?.fortune_type)
  const points = profile?.points || 0
  const currentWeek = getWeekNumber()

  return (
    <SidebarLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                {errorMsg}
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg mb-4">
                <Moon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-stone-800 mb-2">Weekly Fortune</h1>
              <p className="text-stone-500">Week {currentWeek} · {getYear()}</p>
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
                Cost: <span className="text-purple-600 font-semibold">{WEEKLY_COST} coins</span>
              </div>
            </div>

            {/* Fortune Result */}
            {showResult && fortune ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
                <div className={`bg-gradient-to-r ${currentFortune?.color} p-8 text-center text-white`}>
                  <div className="text-6xl mb-4">{currentFortune?.emoji}</div>
                  <h2 className="text-3xl font-bold mb-2">{fortune.fortune_type}</h2>
                  <div className="flex items-center justify-center gap-2 text-white/80">
                    <Calendar className="w-4 h-4" />
                    <span>Week {fortune.week_number} · {fortune.year}</span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="text-center mb-6">
                    <p className="text-stone-600 leading-relaxed text-lg">{fortune.description}</p>
                  </div>

                  {weekAdvice[fortune.fortune_type] && (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-purple-50 rounded-xl p-4">
                          <p className="text-sm text-purple-500 mb-1">Focus This Week</p>
                          <p className="text-stone-700 font-medium">{weekAdvice[fortune.fortune_type].focus}</p>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4">
                          <p className="text-sm text-orange-500 mb-1">Cautions</p>
                          <p className="text-stone-700 font-medium">{weekAdvice[fortune.fortune_type].caution}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-6">
                        <h3 className="font-semibold text-purple-700 mb-3">Lucky Days</h3>
                        <div className="flex flex-wrap gap-2">
                          {weekAdvice[fortune.fortune_type].luckyDays.map(day => (
                            <span key={day} className="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                              ✨ {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-purple-700 font-medium">You have already gotten your fortune this week</p>
                    <p className="text-sm text-purple-600">Come back next week for a new fortune reading!</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Moon className="w-12 h-12 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 mb-2">How is your fortune this week?</h2>
                <p className="text-stone-500 mb-6">
                  Spend {WEEKLY_COST} coins to get your personalized weekly fortune reading
                </p>
                
                {points < WEEKLY_COST && (
                  <div className="bg-red-50 rounded-xl p-4 mb-6">
                    <p className="text-red-600">
                      Not enough coins! You need {WEEKLY_COST} coins, you have {points} coins
                    </p>
                  </div>
                )}

                <button
                  onClick={generateFortune}
                  disabled={generating || points < WEEKLY_COST}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transition-all hover:-translate-y-1 disabled:opacity-50"
                >
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Calculating...
                    </span>
                  ) : (
                    <>Get Fortune ({WEEKLY_COST} coins) <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>

                <p className="mt-4 text-xs text-stone-400">
                  You can only get one fortune per week
                </p>
              </div>
            )}
        </div>
      </div>
    </SidebarLayout>
  )
}
