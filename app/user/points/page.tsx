'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Coins, Gift, History, TrendingUp, Star, Trophy } from 'lucide-react'

const rewardTiers = [
  { tier: 'Beginner', minPoints: 0, maxPoints: 99, icon: '🌱', color: 'text-stone-500', bgColor: 'bg-stone-100' },
  { tier: 'Seeker', minPoints: 100, maxPoints: 499, icon: '📚', color: 'text-blue-500', bgColor: 'bg-blue-100' },
  { tier: 'Adept', minPoints: 500, maxPoints: 999, icon: '✨', color: 'text-purple-500', bgColor: 'bg-purple-100' },
  { tier: 'Master', minPoints: 1000, maxPoints: 4999, icon: '🏆', color: 'text-amber-500', bgColor: 'bg-amber-100' },
  { tier: 'Grandmaster', minPoints: 5000, maxPoints: 9999, icon: '👑', color: 'text-red-500', bgColor: 'bg-red-100' },
  { tier: 'Legend', minPoints: 10000, maxPoints: Infinity, icon: '⭐', color: 'text-cyan-500', bgColor: 'bg-cyan-100' },
]

const pointActivities = [
  { action: 'Daily Login', points: 5, frequency: 'Once per day' },
  { action: 'Burning Incense', points: -10, frequency: 'Each prayer' },
  { action: 'Devotion Prayer', points: -20, frequency: 'Each prayer' },
  { action: 'Light Offering', points: -15, frequency: 'Each prayer' },
  { action: 'Wish Prayer', points: -30, frequency: 'Each prayer' },
  { action: 'Daily Fortune', points: 10, frequency: 'Once per day' },
  { action: 'Weekly Fortune', points: 50, frequency: 'Once per week' },
  { action: 'Monthly Fortune', points: 200, frequency: 'Once per month' },
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
        <div className="flex items-center justify-center min-h-screen">
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

  return (
    <SidebarLayout>
      <div className="p-8">
        <div className="max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg mb-4">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">My Merit Points</h1>
            <p className="text-stone-500">Track your spiritual journey and rewards</p>
          </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Current Status
              </h2>
            </div>
            <div className="text-center py-4">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${currentTier.bgColor} mb-4`}>
                <span className="text-4xl">{currentTier.icon}</span>
              </div>
              <h3 className={`text-xl font-bold ${currentTier.color}`}>{currentTier.tier}</h3>
              <p className="text-stone-500 text-sm mt-1">Level {rewardTiers.indexOf(currentTier) + 1}</p>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-stone-800 text-center">{points.toLocaleString()}</p>
              <p className="text-stone-500 text-sm text-center">Merit Points</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Progress
              </h2>
            </div>
            {nextTier && (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-stone-500">{currentTier.tier}</span>
                    <span className="text-stone-500">{nextTier.tier}</span>
                  </div>
                  <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-amber-700 font-semibold">
                    {pointsToNext} points to reach {nextTier.tier}
                  </p>
                  <p className="text-sm text-amber-600 mt-1">{nextTier.icon} {nextTier.tier} awaits!</p>
                </div>
              </>
            )}
            {!nextTier && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-bold text-stone-800">Congratulations!</p>
                <p className="text-stone-500 text-sm">You have reached the highest tier!</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-500" />
            How to Earn Points
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {pointActivities.map((activity, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl ${activity.points > 0 ? 'bg-green-50' : 'bg-amber-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-800">{activity.action}</p>
                    <p className="text-sm text-stone-500">{activity.frequency}</p>
                  </div>
                  <span className={`font-semibold ${activity.points > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                    {activity.points > 0 ? '+' : ''}{activity.points}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {transactions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-stone-500" />
              Transaction History
            </h2>
            <div className="space-y-3">
              {transactions.map((txn: any) => (
                <div key={txn.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                  <div>
                    <p className="font-medium text-stone-800">{txn.description}</p>
                    <p className="text-sm text-stone-500">{formatDate(txn.created_at)}</p>
                  </div>
                  <span className={`font-semibold ${txn.points > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                    {txn.points > 0 ? '+' : ''}{txn.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </SidebarLayout>
  )
}
