'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Coins, Calendar, Star, TrendingUp, Award, Activity } from 'lucide-react'

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dailyFortune, setDailyFortune] = useState<any>(null)
  const [recentPrayers, setRecentPrayers] = useState<any[]>([])

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

        const { data: fortune } = await supabase
          .from('daily_fortunes')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(1)
        
        if (fortune && fortune.length > 0) {
          setDailyFortune(fortune[0])
        }

        const { data: prayers } = await supabase
          .from('prayers')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        setRecentPrayers(prayers || [])
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-2xl">☯</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
        </div>
      </div>
    )
  }

  const points = profile?.points || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Member Dashboard</h1>
          <p className="text-stone-500">Welcome back, {user?.email?.split('@')[0]}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-emerald-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Coins className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <p className="text-stone-500 text-sm">Merit Points</p>
                <p className="text-2xl font-bold text-stone-800">{points.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-teal-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <p className="text-stone-500 text-sm">Today&apos;s Fortune</p>
                <p className="text-2xl font-bold text-stone-800">
                  {dailyFortune?.fortune_type || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-green-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                <Activity className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-stone-500 text-sm">Prayers Offered</p>
                <p className="text-2xl font-bold text-stone-800">{recentPrayers.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-stone-800">Today&apos;s Fortune</h2>
            </div>
            
            {dailyFortune ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                    dailyFortune.fortune_type === 'Excellent' ? 'bg-green-100' :
                    dailyFortune.fortune_type === 'Good' ? 'bg-emerald-100' :
                    dailyFortune.fortune_type === 'Normal' ? 'bg-amber-100' : 'bg-red-100'
                  }`}>
                    <span className="text-3xl">
                      {dailyFortune.fortune_type === 'Excellent' && '🌟'}
                      {dailyFortune.fortune_type === 'Good' && '✨'}
                      {dailyFortune.fortune_type === 'Normal' && '🌤️'}
                      {dailyFortune.fortune_type === 'Challenging' && '⛅'}
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold ${
                    dailyFortune.fortune_type === 'Excellent' ? 'text-green-600' :
                    dailyFortune.fortune_type === 'Good' ? 'text-emerald-600' :
                    dailyFortune.fortune_type === 'Normal' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {dailyFortune.fortune_type}
                  </h3>
                </div>
                <p className="text-stone-600 text-center">{dailyFortune.description}</p>
                <div className="text-sm text-stone-400 text-center">
                  {formatDate(dailyFortune.created_at)}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-stone-400 mb-4">No fortune reading today</p>
                <a href="/daily-fortune" className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700">
                  Get your daily fortune <span>→</span>
                </a>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-cyan-500" />
              <h2 className="text-lg font-semibold text-stone-800">Quick Actions</h2>
            </div>
            
            <div className="space-y-3">
              <a
                href="/daily-fortune"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:from-emerald-100 hover:to-teal-100 transition-colors"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-800">Daily Fortune</p>
                  <p className="text-sm text-stone-500">Get your personalized reading</p>
                </div>
              </a>

              <a
                href="/user/prayer"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-colors"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-800">Temple Prayer</p>
                  <p className="text-sm text-stone-500">Offer prayers and earn points</p>
                </div>
              </a>

              <a
                href="/user/points"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl hover:from-cyan-100 hover:to-blue-100 transition-colors"
              >
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Coins className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-800">My Points</p>
                  <p className="text-sm text-stone-500">View history and rewards</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {recentPrayers.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Recent Prayers</h2>
            <div className="space-y-3">
              {recentPrayers.map((prayer: any) => (
                <div key={prayer.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                  <div>
                    <p className="font-medium text-stone-800">{prayer.prayer_type}</p>
                    <p className="text-sm text-stone-500">{formatDate(prayer.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-600">+{prayer.points_spent} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
