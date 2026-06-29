'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate, getTodayString } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import {
  Sun,
  Calendar,
  CalendarDays,
  Gift,
  Coins,
  FileText,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Flame,
  Sparkles,
  Clock,
  Info
} from 'lucide-react'

export default function FortunePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkedIn, setCheckedIn] = useState(false)
  const [streak, setStreak] = useState(0)
  const [checkingIn, setCheckingIn] = useState(false)
  const [fortuneHistory, setFortuneHistory] = useState<any[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

        await checkTodayCheckIn(authUser.id)
        await fetchFortuneHistory(authUser.id)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const checkTodayCheckIn = async (userId: string) => {
    const today = getTodayString()

    const { data: transactions, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`)

    if (error) {
      console.error('Error checking check-in status:', error)
      return
    }

    const hasCheckIn = transactions?.some((t: any) => t.description.includes('Daily check-in'))
    setCheckedIn(!!hasCheckIn)

    if (hasCheckIn) {
      const streakCount = await calculateStreak(userId)
      setStreak(streakCount)
    } else {
      const streakCount = await calculateStreak(userId)
      setStreak(streakCount)
    }
  }

  const calculateStreak = async (userId: string): Promise<number> => {
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]

      const { data: transactions, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${dateStr}T00:00:00Z`)
        .lte('created_at', `${dateStr}T23:59:59Z`)

      if (error) {
        console.error('Error calculating streak:', error)
        break
      }

      const hasCheckIn = transactions?.some((t: any) => t.description.includes('Daily check-in'))

      if (hasCheckIn) {
        currentStreak++
      } else if (i > 0) {
        break
      }
    }

    return currentStreak
  }

  const fetchFortuneHistory = async (userId: string) => {
    const { data: fortunes, error } = await supabase
      .from('daily_fortunes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching fortune history:', error)
      return
    }

    setFortuneHistory(fortunes || [])
  }

  const handleCheckIn = async () => {
    if (!user || checkedIn || checkingIn) return

    setCheckingIn(true)
    setMessage(null)

    try {
      const currentStreak = await calculateStreak(user.id)
      const newStreak = currentStreak + 1

      let bonus = 0
      let bonusDesc = ''
      if (newStreak >= 7 && currentStreak < 7) {
        bonus = 15
        bonusDesc = ' (7-day streak bonus!)'
      } else if (newStreak >= 3 && currentStreak < 3) {
        bonus = 5
        bonusDesc = ' (3-day streak bonus!)'
      }

      const basePoints = 2
      const totalPoints = basePoints + bonus

      const currentPoints = profile?.points || 0

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: currentPoints + totalPoints })
        .eq('id', user.id)

      if (updateError) throw updateError

      const { error: txError } = await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          description: `Daily check-in reward${bonusDesc}`,
          points: totalPoints
        })

      if (txError) throw txError

      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)
      setCheckedIn(true)
      setStreak(newStreak)

      setMessage({
        type: 'success',
        text: `Check-in successful! +${totalPoints} coins${bonusDesc}`
      })

      setTimeout(() => setMessage(null), 5000)
    } catch (error: any) {
      console.error('Check-in error:', error)
      setMessage({
        type: 'error',
        text: 'Check-in failed, please try again'
      })
    } finally {
      setCheckingIn(false)
    }
  }

  const getFortuneTypeLabel = (period: string) => {
    switch (period) {
      case 'daily':
        return 'Daily Energy Forecast'
      case 'weekly':
        return 'Weekly Energy Forecast'
      case 'monthly':
        return 'Monthly Energy Forecast'
      default:
        return 'Energy Forecast'
    }
  }

  const getFortuneHref = (period: string, fortune: any) => {
    switch (period) {
      case 'daily':
        return '/fortune/daily'
      case 'weekly':
        return '/fortune/weekly'
      case 'monthly':
        return '/fortune/monthly'
      default:
        return '/fortune'
    }
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Sparkles className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  const points = profile?.points || 0

  const forecastCards = [
    {
      id: 'daily',
      title: 'Daily Energy Forecast',
      description: 'Get your daily energy status, travel suggestions and wellness tips for a balanced day.',
      icon: Sun,
      cost: 5,
      limit: 'Only 1 reading per day',
      buttonText: 'Open Today\'s Forecast',
      href: '/fortune/daily',
      gradient: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'weekly',
      title: '7-Day Weekly Energy Forecast',
      description: 'Preview the energy trend of career, finance and relationship in the coming week, mark your best favorable days.',
      icon: Calendar,
      cost: 20,
      limit: '',
      buttonText: 'View Weekly Trend',
      href: '/fortune/weekly',
      gradient: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    {
      id: 'monthly',
      title: 'Full Monthly Energy Forecast',
      description: 'Comprehensive month-long analysis including work, wealth, love and health, with detailed lucky dates for your important plans.',
      icon: CalendarDays,
      cost: 50,
      limit: '',
      buttonText: 'Generate Monthly Report',
      href: '/fortune/monthly',
      gradient: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600'
    }
  ]

  return (
    <SidebarLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">
              Daily • Weekly • Monthly Energy Forecast
            </h1>
            <p className="text-stone-500 max-w-lg mx-auto">
              Track your life energy rhythm, check in daily and get exclusive wellness guidance.
            </p>
          </div>

          {/* Message Toast */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* Block 1: Daily Check-In Banner */}
          <div className="mb-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <Gift className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Daily Check-In Rewards
                    </h2>
                    <p className="text-emerald-50 text-sm mb-3">
                      Check in every single day to collect free coins. Keep your consecutive streak to get extra bonuses.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        ✅ 3-day streak: Extra +5 Coins
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        ✅ 7-day streak: Extra +15 Coins
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 text-white">
                    <Flame className="w-5 h-5" />
                    <span className="font-bold text-lg">{streak} day streak</span>
                  </div>
                  <button
                    onClick={handleCheckIn}
                    disabled={checkedIn || checkingIn}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                      checkedIn
                        ? 'bg-white/20 text-white/80 cursor-not-allowed backdrop-blur-sm'
                        : 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                    }`}
                  >
                    {checkingIn ? (
                      <>
                        <span className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></span>
                        Checking in...
                      </>
                    ) : checkedIn ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Already Checked In
                      </>
                    ) : (
                      <>
                        <Coins className="w-5 h-5" />
                        Claim Free Coins
                      </>
                    )}
                  </button>
                  <p className="text-emerald-100 text-xs">
                    Streak will reset if you skip one day.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Block 2: Three Forecast Cards */}
          <div className="mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              {forecastCards.slice(0, 2).map((card) => {
                const Icon = card.icon
                return (
                  <Link
                    key={card.id}
                    href={card.href}
                    className={`group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-stone-200 ${
                      points < card.cost ? 'opacity-70' : ''
                    }`}
                  >
                    <div className={`w-14 h-14 ${card.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={`w-7 h-7 ${card.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-stone-800 mb-2">{card.title}</h3>
                    <p className="text-sm text-stone-500 mb-4 line-clamp-3">{card.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <Coins className="w-4 h-4" />
                        {card.cost} Coins
                      </span>
                      {card.limit && (
                        <span className="inline-flex items-center gap-1 text-stone-400 text-xs">
                          <Clock className="w-3 h-3" />
                          {card.limit}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        {card.buttonText}
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                    {points < card.cost && (
                      <p className="mt-3 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Not enough coins
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
            <div className="mt-6 md:col-span-2 mx-auto max-w-md">
              {(() => {
                const card = forecastCards[2]
                const Icon = card.icon
                return (
                  <Link
                    href={card.href}
                    className={`group block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-stone-200 ${
                      points < card.cost ? 'opacity-70' : ''
                    }`}
                  >
                    <div className={`w-14 h-14 ${card.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={`w-7 h-7 ${card.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-stone-800 mb-2">{card.title}</h3>
                    <p className="text-sm text-stone-500 mb-4">{card.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <Coins className="w-4 h-4" />
                        {card.cost} Coins
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        {card.buttonText}
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                    {points < card.cost && (
                      <p className="mt-3 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Not enough coins
                      </p>
                    )}
                  </Link>
                )
              })()}
            </div>
          </div>

          {/* Block 3: My Reading History */}
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-800">My Forecast Records</h2>
                <p className="text-sm text-stone-500">
                  Review all your past daily, weekly and monthly energy analysis at any time.
                </p>
              </div>
            </div>

            <div className="mt-6">
              {fortuneHistory.length > 0 ? (
                <div className="space-y-3">
                  {fortuneHistory.map((fortune) => (
                    <Link
                      key={fortune.id}
                      href={getFortuneHref(fortune.fortune_period, fortune)}
                      className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          fortune.fortune_period === 'daily' ? 'bg-emerald-100' :
                          fortune.fortune_period === 'weekly' ? 'bg-cyan-100' :
                          'bg-violet-100'
                        }`}>
                          {fortune.fortune_period === 'daily' && <Sun className="w-4 h-4 text-emerald-600" />}
                          {fortune.fortune_period === 'weekly' && <Calendar className="w-4 h-4 text-cyan-600" />}
                          {fortune.fortune_period === 'monthly' && <CalendarDays className="w-4 h-4 text-violet-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-800">
                            {getFortuneTypeLabel(fortune.fortune_period)}
                          </p>
                          <p className="text-xs text-stone-500">
                            {formatDate(fortune.date || fortune.created_at)}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-emerald-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Full Text
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-stone-400" />
                  </div>
                  <p className="text-stone-600 font-medium mb-1">No forecast records yet</p>
                  <p className="text-sm text-stone-400">
                    Start your first energy forecast reading above
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Block 4: Simple Rule Text */}
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-stone-800">How To Use</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-stone-800">Sign in every day to get free coins</p>
                  <p className="text-sm text-stone-500">
                    Daily check-in gives you coins, with bonus rewards for maintaining streaks.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-stone-800">Spend coins to unlock energy forecasts</p>
                  <p className="text-sm text-stone-500">
                    Use your coins to access daily, weekly and monthly personalized energy forecasts.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-stone-800">Daily forecast is limited to once per day</p>
                  <p className="text-sm text-stone-500">
                    To ensure high-quality guidance, daily forecast readings are limited to one per day.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Compliance Text */}
          <div className="text-center text-xs text-stone-400 pb-8 max-w-lg mx-auto">
            <p>
              All energy forecast content is for entertainment and wellness reference only.
              It shall not be regarded as life prediction, medical advice or investment suggestion.
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
