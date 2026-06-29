'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import {
  Coins, Calendar, Star, TrendingUp, Award, Activity, Settings, Heart,
  Sparkles, Zap, Gift, Shield, ChevronRight, Clock, Crown, Flame, Sun,
  CheckCircle, FileText, AlertCircle
} from 'lucide-react'

const COINS_COST_DAILY = 5
const COINS_COST_WEEKLY = 20
const COINS_COST_MONTHLY = 50

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [readingHistory, setReadingHistory] = useState<any[]>([])

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

        // Check if already checked in today
        const today = new Date().toISOString().split('T')[0]
        const { data: checkInData } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('description', 'Daily check-in bonus')
          .gte('created_at', today + 'T00:00:00')
          .lte('created_at', today + 'T23:59:59')
          .limit(1)

        setCheckedIn(!!(checkInData && checkInData.length > 0))

        // Fetch reading history
        const { data: dailyData } = await supabase
          .from('daily_fortunes')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(10)

        const historyItems = (dailyData || []).map((item: any) => ({
          ...item,
          type: 'Daily Energy Reading',
          period: 'daily'
        }))

        setReadingHistory(historyItems)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDailyCheckIn = async () => {
    if (!user || checkedIn || checkingIn) return

    setCheckingIn(true)
    try {
      const currentPoints = profile?.points || 0
      const bonusPoints = 5 // Default bonus

      // Update user points
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: currentPoints + bonusPoints })
        .eq('id', user.id)

      if (updateError) {
        alert('Failed to claim bonus: ' + updateError.message)
        setCheckingIn(false)
        return
      }

      // Record transaction
      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          description: 'Daily check-in bonus',
          points: bonusPoints
        })

      setCheckedIn(true)
      setProfile({ ...profile, points: currentPoints + bonusPoints })
      alert(`Congratulations! You received ${bonusPoints} free coins!`)
    } catch (error) {
      console.error('Error during check-in:', error)
      alert('Failed to claim bonus. Please try again.')
    } finally {
      setCheckingIn(false)
    }
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <span className="text-2xl">☯</span>
            </div>
            <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  const points = profile?.points || 0

  const features = [
    {
      icon: Sun,
      title: 'Daily Energy Reading',
      desc: "Get today's mood tips, travel suggestions, and wellness guidance to keep your energy balanced.",
      href: '/fortune/daily',
      cost: COINS_COST_DAILY,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
    },
    {
      icon: Calendar,
      title: '7-Day Weekly Energy Trend',
      desc: 'Preview your career, finance, and relationship energy for the whole week, plus your most favorable days.',
      href: '/fortune/weekly',
      cost: COINS_COST_WEEKLY,
      gradient: 'from-purple-500 to-indigo-500',
      bgGradient: 'from-purple-50 to-indigo-50',
    },
    {
      icon: Crown,
      title: 'Full Monthly Energy Wellness Report',
      desc: 'In-depth analysis covering work, wealth, romance and health, with carefully picked favorable dates for your plans.',
      href: '/fortune/monthly',
      cost: COINS_COST_MONTHLY,
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-50 to-blue-50',
    },
  ]

  return (
    <SidebarLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">

          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-2">
              Your Personal Energy Center
            </h1>
            <p className="text-stone-500 max-w-lg mx-auto text-sm">
              Check in every day to earn free coins and unlock your personalized life energy forecast
            </p>
          </div>

          {/* Module 1: Daily Check-In Reward */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Daily Check-In Reward</h2>
              </div>
              <p className="text-emerald-100 mb-4 max-w-lg">
                Claim free coins every 24 hours. Earn extra bonuses for consecutive daily logins.
              </p>
              <ul className="text-emerald-100 text-sm mb-6 space-y-1">
                <li>3 consecutive check-ins: Extra +5 Coins</li>
                <li>7 consecutive check-ins: Extra +15 Coins</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {checkedIn ? (
                  <button
                    disabled
                    className="px-6 py-3 bg-white/30 backdrop-blur text-white font-semibold rounded-xl cursor-not-allowed opacity-60"
                  >
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Checked In Today — Come Back Tomorrow
                  </button>
                ) : (
                  <button
                    onClick={handleDailyCheckIn}
                    disabled={checkingIn}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    {checkingIn ? (
                      <>
                        <span className="w-5 h-5 border-2 border-emerald-300/30 border-t-emerald-600 rounded-full animate-spin"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        Claim My Free Coins
                      </>
                    )}
                  </button>
                )}
                <p className="text-emerald-200 text-xs">
                  Rewards reset if you miss a day. Keep your streak going to get more bonus coins.
                </p>
              </div>
            </div>
          </div>

          {/* Module 2: Three Energy Reading Service Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-stone-800 mb-4">Energy Reading Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-5 shadow-lg border border-stone-100 hover:shadow-xl transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-stone-800 mb-2">{feature.title}</h3>
                    <p className="text-sm text-stone-500 mb-4 leading-relaxed">{feature.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                        {feature.cost} Coins
                      </span>
                      <Link
                        href={feature.href}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        {index === 0 ? "Unlock Today's Reading" : index === 1 ? "View Weekly Forecast" : "Generate My Report"}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Module 3: How The System Works */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-stone-800 mb-4">How It Works</h2>
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="text-stone-700 font-medium">Complete your daily check-in to receive free coins without any cost.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="text-stone-700 font-medium">Spend your coins to unlock personalized energy analysis reports.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="text-stone-700 font-medium">Daily readings have a one-time daily limit to keep each result focused and meaningful.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Module 4: My Reading History */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-stone-800 mb-4">My Past Energy Reports</h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-100">
              {readingHistory.length > 0 ? (
                <div className="space-y-3">
                  {readingHistory.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-500" />
                        <div>
                          <p className="font-medium text-stone-800">{formatDate(item.created_at)} — {item.type}</p>
                        </div>
                      </div>
                      <Link
                        href={item.period === 'daily' ? '/fortune/daily' : item.period === 'weekly' ? '/fortune/weekly' : '/fortune/monthly'}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        View Full Report
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">No reading history yet. Unlock your first energy reading above!</p>
                </div>
              )}
            </div>
          </div>

          {/* Policy Text */}
          <div className="text-center py-6 border-t border-stone-200">
            <p className="text-xs text-stone-400 max-w-2xl mx-auto">
              All energy analysis content is created for wellness reference and entertainment only. It is not life prediction, medical guidance or investment advice.
            </p>
          </div>

        </div>
      </div>
    </SidebarLayout>
  )
}
