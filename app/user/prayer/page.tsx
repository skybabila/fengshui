'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import {
  Leaf, Coins, Sparkles, Clock, CheckCircle2, Calendar,
  BookOpen, FileText, History, ChevronRight, X, Zap,
  Award, Flame, Sun, Heart, Star, TrendingUp
} from 'lucide-react'

const streakRewards = [
  { days: 3, coins: 6, label: '3-Day Streak', icon: Leaf },
  { days: 7, coins: 18, label: '7-Day Streak', icon: Sun },
  { days: 15, coins: 40, label: '15-Day Streak', icon: Award },
]

const extraWays = [
  {
    icon: BookOpen,
    title: 'Read One Feng Shui Wellness Article',
    points: '+2 Coins/day',
    desc: 'Learn wellness tips for daily balance',
    href: '/articles',
    gradient: 'from-emerald-400 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50',
  },
  {
    icon: FileText,
    title: 'Save Wish To Private Records',
    points: '+1 Coin/day',
    desc: 'Keep your positive wishes private',
    href: '#',
    gradient: 'from-cyan-400 to-blue-500',
    bgGradient: 'from-cyan-50 to-blue-50',
    locked: true,
  },
]

export default function PositiveWishPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [wishes, setWishes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [todayCompleted, setTodayCompleted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [wishText, setWishText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [streakDays, setStreakDays] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

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

        const today = new Date().toISOString().split('T')[0]
        const { data: todayWishes } = await supabase
          .from('wishes')
          .select('*')
          .eq('user_id', authUser.id)
          .gte('created_at', today + 'T00:00:00')
          .lte('created_at', today + 'T23:59:59')
          .limit(1)

        setTodayCompleted(!!(todayWishes && todayWishes.length > 0))

        const { data: userWishes } = await supabase
          .from('wishes')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(20)

        setWishes(userWishes || [])

        if (userWishes && userWishes.length > 0) {
          const streak = calculateStreak(userWishes)
          setStreakDays(streak)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  function calculateStreak(wishList: any[]): number {
    if (!wishList || wishList.length === 0) return 0

    const dates = new Set(
      wishList.map((w: any) => new Date(w.created_at).toISOString().split('T')[0])
    )

    let streak = 0
    const today = new Date()
    let checkDate = new Date(today)

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (dates.has(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const handleSubmitWish = async () => {
    if (!user || submitting) return
    if (wishText.trim().length < 10 || wishText.trim().length > 150) return

    setSubmitting(true)
    try {
      const currentPoints = profile?.points || 0
      const bonusPoints = 4

      const { error: insertError } = await supabase
        .from('wishes')
        .insert({
          user_id: user.id,
          content: wishText.trim(),
          is_public: false,
          points_spent: 0,
        })

      if (insertError) {
        alert('Failed to submit wish: ' + insertError.message)
        setSubmitting(false)
        return
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: currentPoints + bonusPoints })
        .eq('id', user.id)

      if (updateError) {
        alert('Failed to add coins: ' + updateError.message)
        setSubmitting(false)
        return
      }

      try {
        await supabase.from('point_transactions').insert({
          user_id: user.id,
          description: 'Daily Positive Wish Bonus',
          points: bonusPoints,
        })
      } catch (e) {
        console.warn('Transaction record failed:', e)
      }

      const newStreak = streakDays + 1
      let streakBonus = 0
      for (const reward of streakRewards) {
        if (newStreak === reward.days) {
          streakBonus = reward.coins
          break
        }
      }

      if (streakBonus > 0) {
        const { error: streakUpdateError } = await supabase
          .from('user_profiles')
          .update({ points: currentPoints + bonusPoints + streakBonus })
          .eq('id', user.id)

        if (!streakUpdateError) {
          try {
            await supabase.from('point_transactions').insert({
              user_id: user.id,
              description: `${newStreak}-Day Streak Bonus`,
              points: streakBonus,
            })
          } catch (e) {
            console.warn('Streak transaction failed:', e)
          }
        }
      }

      const updatedProfile = await getUserProfile(user.id)
      if (updatedProfile) setProfile(updatedProfile)

      const { data: refreshedWishes } = await supabase
        .from('wishes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setWishes(refreshedWishes || [])
      setStreakDays(newStreak)
      setTodayCompleted(true)
      setShowModal(false)
      setWishText('')
      setShowSuccess(true)

      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error submitting wish:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Leaf className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  const points = profile?.points || 0
  const charCount = wishText.trim().length
  const isValid = charCount >= 10 && charCount <= 150

  return (
    <SidebarLayout>
      <div className="p-6 md:p-8 pb-32">
        <div className="max-w-4xl mx-auto">

          {showSuccess && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
              <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Wish submitted! +4 Coins earned</span>
              </div>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setWishText('')
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Write Your Positive Wish</h3>
                  <p className="text-sm text-stone-500">Share a sincere positive thought for yourself or someone you care about</p>
                </div>

                <div className="mb-6">
                  <textarea
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="Write your positive wish here... (e.g., May my family stay healthy and filled with peace)"
                    className="w-full h-32 p-4 border-2 border-stone-200 rounded-2xl resize-none focus:outline-none focus:border-emerald-400 transition-colors text-stone-700 placeholder-stone-400"
                    maxLength={150}
                  />
                  <div className="flex justify-between mt-2 text-xs">
                    <span className={charCount < 10 ? 'text-orange-500' : 'text-stone-400'}>
                      {charCount < 10 ? `Minimum 10 characters (${charCount}/10)` : 'Good length'}
                    </span>
                    <span className="text-stone-400">{charCount}/150</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setWishText('')
                    }}
                    className="flex-1 py-3 bg-stone-100 text-stone-600 font-semibold rounded-2xl hover:bg-stone-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitWish}
                    disabled={!isValid || submitting}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4" />
                        Submit Wish & Claim +4 Coins
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Prayer & Positive Energy Ritual</h1>
            <p className="text-stone-500 max-w-lg mx-auto">
              Send sincere positive wishes, accumulate peaceful life energy, and earn free daily coin rewards.
            </p>
          </div>

          {/* Daily Wish Mission Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 md:p-8 mb-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-emerald-100 text-sm font-medium mb-3">
                    <Star className="w-4 h-4" />
                    Daily Mission
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Daily Positive Wish</h2>
                  <p className="text-emerald-100">Write one sincere positive wish each day</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-white">
                    <Coins className="w-6 h-6" />
                    <span className="text-3xl font-bold">+4</span>
                  </div>
                  <p className="text-emerald-100 text-sm">Coins/day</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6 text-emerald-100 text-sm">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>{streakDays} day streak</span>
                </div>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Resets daily</span>
                </div>
              </div>

              {todayCompleted ? (
                <button
                  disabled
                  className="w-full py-4 bg-white/20 text-white/80 font-semibold rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Task Completed — Come Back Tomorrow
                </button>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-4 bg-white text-emerald-600 font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Start Writing My Wish
                </button>
              )}
            </div>
          </div>

          {/* Consecutive Streak Reward Card */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-stone-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-800">Consecutive Streak Rewards</h2>
                <p className="text-sm text-stone-500">Keep the momentum — extra bonuses for consistent practice</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {streakRewards.map((reward, index) => {
                const Icon = reward.icon
                const isAchieved = streakDays >= reward.days
                const isNext = !isAchieved && (index === 0 || streakDays >= streakRewards[index - 1].days)
                const progress = Math.min((streakDays / reward.days) * 100, 100)

                return (
                  <div
                    key={index}
                    className={`relative p-4 rounded-2xl text-center transition-all ${
                      isAchieved
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200'
                        : isNext
                        ? 'bg-stone-50 border-2 border-emerald-200'
                        : 'bg-stone-50 border border-stone-100 opacity-60'
                    }`}
                  >
                    {isAchieved && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                      isAchieved
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                        : 'bg-stone-200'
                    }`}>
                      <Icon className={`w-5 h-5 ${isAchieved ? 'text-white' : 'text-stone-400'}`} />
                    </div>

                    <p className="font-bold text-stone-700 text-sm mb-0.5">{reward.label}</p>
                    <div className="flex items-center justify-center gap-1 text-amber-600 font-bold text-sm mb-2">
                      <Coins className="w-3.5 h-3.5" />
                      +{reward.coins}
                    </div>

                    {!isAchieved && (
                      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    )}

                    {isAchieved && (
                      <p className="text-xs text-emerald-600 font-medium">Unlocked!</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Extra Ways To Earn Coins */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-stone-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center shadow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-800">Extra Ways To Earn Coins</h2>
                <p className="text-sm text-stone-500">More ways to accumulate life energy rewards</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {extraWays.map((way, index) => {
                const Icon = way.icon
                return (
                  <Link
                    key={index}
                    href={way.locked ? '#' : way.href}
                    className={`group relative p-4 rounded-2xl border transition-all ${
                      way.locked
                        ? 'bg-stone-50 border-stone-200 cursor-not-allowed opacity-70'
                        : `bg-gradient-to-br ${way.bgGradient} border-stone-100 hover:shadow-md hover:-translate-y-0.5`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${way.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-stone-800 text-sm mb-1">{way.title}</h3>
                        <p className="text-xs text-stone-500 mb-2">{way.desc}</p>
                        <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-lg">
                          {way.points}
                        </span>
                      </div>
                      {!way.locked && (
                        <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                      )}
                      {way.locked && (
                        <span className="text-xs text-stone-400 flex-shrink-0">🔜</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* My Past Positive Wishes */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-stone-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-800">My Past Positive Wishes</h2>
                <p className="text-sm text-stone-500">A record of your sincere thoughts</p>
              </div>
            </div>

            {wishes.length > 0 ? (
              <div className="space-y-3">
                {wishes.map((wish: any) => (
                  <div
                    key={wish.id}
                    className="p-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-2xl border border-emerald-100"
                  >
                    <p className="text-stone-700 leading-relaxed mb-2">
                      &ldquo;{wish.content}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-stone-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(wish.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <Heart className="w-3.5 h-3.5" />
                        <span>Life energy +4</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-7 h-7 text-stone-300" />
                </div>
                <p className="text-stone-500 mb-1">No wishes yet</p>
                <p className="text-stone-400 text-sm">Start your journey by writing your first positive wish</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coin Quick Bar */}
      <div className="fixed bottom-0 left-0 right-0 ml-64 bg-white/95 backdrop-blur-lg border-t border-stone-200 px-6 py-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-stone-400">Current Balance</p>
              <p className="text-xl font-bold text-stone-800">{points.toLocaleString()} <span className="text-sm font-normal text-stone-500">Coins</span></p>
            </div>
          </div>

          <Link
            href="/user/points"
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Earn More Coins
          </Link>
        </div>
      </div>
    </SidebarLayout>
  )
}
