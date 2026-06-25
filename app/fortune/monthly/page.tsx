'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate, getTodayString, getMonthNumber, getYear } from '@/lib/utils'
import { Star, Calendar, Sparkles, Coins, ArrowRight, Clock } from 'lucide-react'

const MONTHLY_COST = 50

const fortuneTypes = [
  { type: 'Great Fortune', emoji: '🌟', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-100', textColor: 'text-green-600' },
  { type: 'Good Fortune', emoji: '✨', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
  { type: 'Moderate Fortune', emoji: '🌤️', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
  { type: 'Small Fortune', emoji: '⛅', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  { type: 'Average', emoji: '☁️', color: 'from-gray-500 to-slate-500', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
]

const monthAdvice: Record<string, { overview: string; career: string; wealth: string; love: string; health: string; luckyDays: number[] }> = {
  'Great Fortune': {
    overview: 'Excellent fortune this month! Everything goes smoothly with noble people helping you. Perfect time for new plans.',
    career: 'Great career fortune. Good for exploring new areas. Seize opportunities and you will be rewarded.',
    wealth: 'Prosperous wealth luck. Investments and finances are favorable, but decisions should be made carefully.',
    love: 'Good relationship fortune. Singles may meet someone special, married couples will feel the warmth grow.',
    health: 'Good health condition. Abundant energy, good time to increase exercise.',
    luckyDays: [3, 8, 15, 22, 28]
  },
  'Good Fortune': {
    overview: 'Good fortune, everything goes well. Stay positive and good luck will follow.',
    career: 'Steady progress at work. Good for advancing projects steadily, not advisable to take risks.',
    wealth: 'Stable wealth luck. Steady income, good for saving and financial planning.',
    love: 'Harmonious relationships. Good for improving communication and resolving misunderstandings.',
    health: 'Decent health. Pay attention to regular schedule, avoid staying up late.',
    luckyDays: [5, 12, 20]
  },
  'Moderate Fortune': {
    overview: 'Steady and improving fortune. Take things step by step. Stay focused and move forward steadily.',
    career: 'Work proceeds as planned. Not suitable for major moves. Be patient.',
    wealth: 'Moderate wealth luck. Balanced income and expenses. Not suitable for large investments.',
    love: 'Stable relationships. Good for nurturing feelings, don\'t be impatient.',
    health: 'Average health. Pay attention to healthy diet and moderate exercise.',
    luckyDays: [7, 14, 21]
  },
  'Small Fortune': {
    overview: 'Decent fortune with minor ups and downs. Proceed with caution and turn dangers into safety.',
    career: 'Minor challenges at work. Stay cautious and listen to advice.',
    wealth: 'Weak wealth luck. Control expenses and avoid impulsive spending.',
    love: 'Minor ups and downs in relationships. Need patient communication.',
    health: 'Pay attention to rest and avoid overwork.',
    luckyDays: [10, 25]
  },
  'Average': {
    overview: 'Plain fortune. Better to stay still than move. Cultivate yourself and wait for a turning point.',
    career: 'Stable work. Not advisable to make changes. Wait and see.',
    wealth: 'Average wealth luck. Be careful with finances, avoid risks.',
    love: 'Plain relationships. Good for solo reflection.',
    health: 'Pay attention to wellness and maintain a peaceful mindset.',
    luckyDays: [18]
  },
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function MonthlyFortunePage() {
  const [fortune, setFortune] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)
  const [hasMonthFortune, setHasMonthFortune] = useState(false)

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

        const currentMonth = getMonthNumber()
        const currentYear = getYear()

        const { data: existing } = await supabase
          .from('daily_fortunes')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('fortune_period', 'monthly')
          .eq('month_number', currentMonth)
          .eq('year', currentYear)
          .single()
        
        if (existing) {
          setFortune(existing)
          setShowResult(true)
          setHasMonthFortune(true)
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
      alert('Please log in to get your fortune')
      return
    }

    const points = profile?.points || 0
    if (points < MONTHLY_COST) {
      alert(`Not enough coins! Monthly fortune costs ${MONTHLY_COST} coins, you have ${points} coins`)
      return
    }

    if (hasMonthFortune) {
      alert('You have already gotten your fortune this month, come back next month!')
      return
    }

    setGenerating(true)

    try {
      await supabase
        .from('user_profiles')
        .update({ points: points - MONTHLY_COST })
        .eq('id', user.id)

      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          description: 'Monthly fortune cost',
          points: -MONTHLY_COST
        })

      const currentMonth = getMonthNumber()
      const currentYear = getYear()
      
      const randomIndex = Math.floor(Math.random() * fortuneTypes.length)
      const selectedFortune = fortuneTypes[randomIndex]

      const advice = monthAdvice[selectedFortune.type]

      const { data: newFortune, error } = await supabase
        .from('daily_fortunes')
        .insert({
          user_id: user.id,
          date: getTodayString(),
          fortune_type: selectedFortune.type,
          description: advice.overview,
          fortune_period: 'monthly',
          month_number: currentMonth,
          year: currentYear,
        })
        .select()
        .single()

      if (error) throw error

      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)

      setFortune(newFortune)
      setShowResult(true)
      setHasMonthFortune(true)
    } catch (error) {
      console.error('Error generating fortune:', error)
      alert('Failed to generate fortune, please try again later')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-2xl">🌟</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
        </div>
      </div>
    )
  }

  const currentFortune = fortuneTypes.find(f => f.type === fortune?.fortune_type)
  const points = profile?.points || 0
  const currentMonth = getMonthNumber()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Monthly Fortune</h1>
          <p className="text-stone-500">{monthNames[currentMonth - 1]} · {getYear()}</p>
        </div>

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
            Cost: <span className="text-cyan-600 font-semibold">{MONTHLY_COST} coins</span>
          </div>
        </div>

        {showResult && fortune ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
            <div className={`bg-gradient-to-r ${currentFortune?.color} p-8 text-center text-white`}>
              <div className="text-6xl mb-4">{currentFortune?.emoji}</div>
              <h2 className="text-3xl font-bold mb-2">{fortune.fortune_type}</h2>
              <div className="flex items-center justify-center gap-2 text-white/80">
                <Calendar className="w-4 h-4" />
                <span>{monthNames[fortune.month_number - 1]} · {fortune.year}</span>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-stone-600 leading-relaxed text-lg">{fortune.description}</p>
              </div>

              {monthAdvice[fortune.fortune_type] && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm text-blue-500 mb-1">💼 Career</p>
                      <p className="text-stone-700 text-sm">{monthAdvice[fortune.fortune_type].career}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm text-amber-500 mb-1">💰 Wealth</p>
                      <p className="text-stone-700 text-sm">{monthAdvice[fortune.fortune_type].wealth}</p>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-4">
                      <p className="text-sm text-pink-500 mb-1">💕 Love</p>
                      <p className="text-stone-700 text-sm">{monthAdvice[fortune.fortune_type].love}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm text-green-500 mb-1">🏥 Health</p>
                      <p className="text-stone-700 text-sm">{monthAdvice[fortune.fortune_type].health}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-cyan-700 mb-3">Lucky Days This Month</h3>
                    <div className="flex flex-wrap gap-2">
                      {monthAdvice[fortune.fortune_type].luckyDays.map(day => (
                        <span key={day} className="inline-flex items-center bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
                          ✨ Day {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="bg-cyan-50 rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                <p className="text-cyan-700 font-medium">You have already gotten your fortune this month</p>
                <p className="text-sm text-cyan-600">Come back next month for a new fortune reading!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-12 h-12 text-cyan-500" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">How is your fortune this month?</h2>
            <p className="text-stone-500 mb-6">
              Spend {MONTHLY_COST} coins to get your personalized monthly fortune reading
            </p>
            
            {points < MONTHLY_COST && (
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <p className="text-red-600">
                  Not enough coins! You need {MONTHLY_COST} coins, you have {points} coins
                </p>
              </div>
            )}

            <button
              onClick={generateFortune}
              disabled={generating || points < MONTHLY_COST}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-200 hover:shadow-xl hover:shadow-cyan-300 transition-all hover:-translate-y-1 disabled:opacity-50"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Calculating...
                </span>
              ) : (
                <>Get Fortune ({MONTHLY_COST} coins) <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <p className="mt-4 text-xs text-stone-400">
              You can only get one fortune per month
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
