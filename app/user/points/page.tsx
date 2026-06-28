'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Coins, Gift, History, TrendingUp, Star, Trophy, Sparkles, ChevronRight, Clock, Award, Zap, Heart, Flame } from 'lucide-react'

const rewardTiers = [
  { tier: 'Beginner', minPoints: 0, maxPoints: 99, icon: '🌱', color: 'text-stone-500', bgColor: 'bg-stone-100', gradient: 'from-stone-400 to-stone-500' },
  { tier: 'Seeker', minPoints: 100, maxPoints: 499, icon: '📚', color: 'text-blue-500', bgColor: 'bg-blue-100', gradient: 'from-blue-400 to-cyan-500' },
  { tier: 'Adept', minPoints: 500, maxPoints: 999, icon: '✨', color: 'text-purple-500', bgColor: 'bg-purple-100', gradient: 'from-purple-400 to-violet-500' },
  { tier: 'Master', minPoints: 1000, maxPoints: 4999, icon: '🏆', color: 'text-amber-500', bgColor: 'bg-amber-100', gradient: 'from-amber-400 to-orange-500' },
  { tier: 'Grandmaster', minPoints: 5000, maxPoints: 9999, icon: '👑', color: 'text-red-500', bgColor: 'bg-red-100', gradient: 'from-red-400 to-rose-500' },
  { tier: 'Legend', minPoints: 10000, maxPoints: Infinity, icon: '⭐', color: 'text-cyan-500', bgColor: 'bg-cyan-100', gradient: 'from-cyan-400 to-teal-500' },
]

const earnWays = [
  { icon: Sparkles, title: 'Daily Check-in', points: '+5 Coins (Collect every day)', desc: '', href: '#', gradient: 'from-amber-400 to-orange-500', bgGradient: 'from-amber-50 to-orange-50' },
  { icon: Star, title: 'Daily Fortune Reading', points: '+10 Coins', desc: '', href: '/fortune/daily', gradient: 'from-purple-400 to-indigo-500', bgGradient: 'from-purple-50 to-indigo-50' },
  { icon: Zap, title: 'Weekly Fortune Reading', points: '+50 Coins', desc: '', href: '/fortune/weekly', gradient: 'from-cyan-400 to-blue-500', bgGradient: 'from-cyan-50 to-blue-50' },
  { icon: Trophy, title: 'Monthly Fortune Reading', points: '+200 Coins', desc: '', href: '/fortune/monthly', gradient: 'from-emerald-400 to-teal-500', bgGradient: 'from-emerald-50 to-teal-50' },
  { icon: Heart, title: 'Invite Friends', points: '+50 Coins per new member', desc: '', href: '#', gradient: 'from-pink-400 to-rose-500', bgGradient: 'from-pink-50 to-rose-50' },
  { icon: Award, title: 'Complete Profile', points: '+100 One-Time Bonus', desc: '', href: '/user/profile', gradient: 'from-violet-400 to-purple-500', bgGradient: 'from-violet-50 to-purple-50' },
]

export default function PointsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

        const { data: txns } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(20)
        
        setTransactions(txns || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Coins className="w-8 h-8 text-cyan-500" />
            </div>
            <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  const points = profile?.points || 0
  
  const currentTier = rewardTiers.find(t => points >= t.minPoints && points <= t.maxPoints) || rewardTiers[0]
  const nextTier = rewardTiers.find(t => points < t.minPoints)
  const pointsToNext = nextTier ? nextTier.minPoints - points : 0
  const progressPercent = nextTier 
    ? ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 
    : 100

  const totalEarned = transactions.filter((t: any) => t.points > 0).reduce((sum: number, t: any) => sum + t.points, 0)
  const totalSpent = Math.abs(transactions.filter((t: any) => t.points < 0).reduce((sum: number, t: any) => sum + t.points, 0))

  return (
    <SidebarLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg mb-4">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">My Merit Coins</h1>
            <p className="text-stone-500">Complete simple tasks to earn coins and unlock premium fortune readings</p>
          </div>

          {/* Big Balance Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-6 md:p-8 mb-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-amber-100 text-sm mb-1">Current Balance</p>
                  <p className="text-5xl md:text-6xl font-bold text-white">{points.toLocaleString()}</p>
                  <p className="text-amber-100 mt-2">Merit Coins</p>
                </div>
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl md:text-5xl`}>
                  {currentTier.icon}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-amber-100 mb-2">
                    <span>{currentTier.tier}</span>
                    <span>{nextTier ? nextTier.tier : 'MAX'}</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              {nextTier && (
                <p className="text-center text-amber-100 text-sm mt-3">
                  Only {pointsToNext.toLocaleString()} more coins to upgrade to {nextTier.tier} Tier
                </p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm text-stone-500">Total Earned</p>
              <p className="text-lg font-bold text-emerald-600">+{totalEarned}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Flame className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-sm text-stone-500">Total Spent</p>
              <p className="text-lg font-bold text-rose-500">-{totalSpent}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className={`w-10 h-10 bg-gradient-to-br ${currentTier.gradient} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-stone-500">Current Tier</p>
              <p className={`text-lg font-bold ${currentTier.color}`}>{currentTier.tier}</p>
            </div>
          </div>

          {/* Tier Progress Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-stone-100">
            <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              All Tiers
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {rewardTiers.map((tier, index) => {
                const isUnlocked = points >= tier.minPoints
                const isCurrent = tier.tier === currentTier.tier
                return (
                  <div
                    key={index}
                    className={`relative p-3 rounded-xl text-center transition-all ${
                      isCurrent
                        ? `bg-gradient-to-br ${tier.gradient} text-white shadow-lg scale-105`
                        : isUnlocked
                          ? 'bg-stone-50 border border-stone-200'
                          : 'bg-stone-50 border border-stone-100 opacity-50'
                    }`}
                  >
                    <div className={`text-2xl mb-1 ${isCurrent ? '' : ''}`}>
                      {tier.icon}
                    </div>
                    <p className={`text-xs font-semibold ${isCurrent ? 'text-white' : isUnlocked ? 'text-stone-700' : 'text-stone-400'}`}>
                      {tier.tier}
                    </p>
                    <p className={`text-xs mt-0.5 ${isCurrent ? 'text-white/80' : 'text-stone-400'}`}>
                      {tier.maxPoints === Infinity ? '10k+' : tier.minPoints}
                    </p>
                    {isCurrent && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                        <span className="text-xs">👑</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Earn More Coins */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-stone-100">
            <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" />
              Earn More Coins
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {earnWays.map((way, index) => {
                const Icon = way.icon
                const isLocked = way.href === '#'
                return (
                  <Link
                    key={index}
                    href={isLocked ? '#' : way.href}
                    className={`group relative p-4 rounded-xl border transition-all ${
                      isLocked
                        ? 'bg-stone-50 border-stone-200 cursor-not-allowed opacity-60'
                        : `bg-gradient-to-br ${way.bgGradient} border-stone-100 hover:shadow-md hover:-translate-y-0.5`
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${way.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-stone-800 text-sm mb-1">{way.title}</h3>
                    <p className="text-xs text-stone-500 mb-2">{way.desc}</p>
                    <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-lg">
                      {way.points}
                    </span>
                    {isLocked && (
                      <div className="absolute top-2 right-2 text-xs text-stone-400">
                        🔜
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Transaction History */}
          {transactions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-stone-100">
              <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-stone-500" />
                Recent Transactions
              </h2>
              <div className="space-y-2">
                {transactions.map((txn: any) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        txn.points > 0 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {txn.points > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <Coins className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-stone-800 text-sm">{txn.description}</p>
                        <p className="text-xs text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(txn.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold ${txn.points > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {txn.points > 0 ? '+' : ''}{txn.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {transactions.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-stone-100">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-stone-400" />
              </div>
              <p className="text-stone-500 mb-2">No transactions yet</p>
              <p className="text-stone-400 text-sm">Start earning coins by exploring features!</p>
              <Link
                href="/fortune/daily"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Get Daily Fortune
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}
