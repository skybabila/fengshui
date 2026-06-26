'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Coins, Calendar, Star, TrendingUp, Award, Activity, Settings, Heart } from 'lucide-react'

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dailyFortune, setDailyFortune] = useState<any>(null)
  const [recentPrayers, setRecentPrayers] = useState<any[]>([])
  const [wishCount, setWishCount] = useState(0)

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
          .eq('fortune_period', 'daily')
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

        const { count } = await supabase
          .from('wishes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authUser.id)
        
        setWishCount(count || 0)
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

  const getFortuneEmoji = (type: string) => {
    switch (type) {
      case 'Great Fortune': return '🌟'
      case 'Good Fortune': return '✨'
      case 'Moderate Fortune': return '🌤️'
      case 'Small Fortune': return '⛅'
      case 'Average': return '☁️'
      default: return '🌟'
    }
  }

  const getFortuneBgClass = (type: string) => {
    switch (type) {
      case 'Great Fortune': return 'bg-green-100'
      case 'Good Fortune': return 'bg-emerald-100'
      case 'Moderate Fortune': return 'bg-amber-100'
      case 'Small Fortune': return 'bg-orange-100'
      case 'Average': return 'bg-gray-100'
      default: return 'bg-green-100'
    }
  }

  const getFortuneTextClass = (type: string) => {
    switch (type) {
      case 'Great Fortune': return 'text-green-600'
      case 'Good Fortune': return 'text-emerald-600'
      case 'Moderate Fortune': return 'text-amber-600'
      case 'Small Fortune': return 'text-orange-600'
      case 'Average': return 'text-gray-600'
      default: return 'text-green-600'
    }
  }

  return (
    <SidebarLayout>
      <div className="p-8">
        <div className="max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Member Center</h1>
            <p className="text-stone-500">Welcome back, {profile?.nickname || profile?.name || user?.email?.split('@')[0]}</p>
          </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-stone-500 text-sm">My Coins</p>
                <p className="text-xl font-bold text-stone-800">{points.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-teal-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-stone-500 text-sm">Daily Fortune</p>
                <p className="text-xl font-bold text-stone-800">
                  {dailyFortune?.fortune_type || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-green-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-stone-500 text-sm">Prayers</p>
                <p className="text-xl font-bold text-stone-800">{recentPrayers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-pink-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-stone-500 text-sm">Wishes</p>
                <p className="text-xl font-bold text-stone-800">{wishCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-stone-800">Fortune Today</h2>
            </div>
            
            {dailyFortune ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${getFortuneBgClass(dailyFortune.fortune_type)}`}>
                    <span className="text-3xl">{getFortuneEmoji(dailyFortune.fortune_type)}</span>
                  </div>
                  <h3 className={`text-xl font-bold ${getFortuneTextClass(dailyFortune.fortune_type)}`}>
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
                <p className="text-stone-400 mb-4">Fortune not yet obtained for today</p>
                <a href="/fortune/daily" className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700">
                  Get Fortune for Today <span>→</span>
                </a>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-cyan-500" />
              <h2 className="text-lg font-semibold text-stone-800">Quick Links</h2>
            </div>
            
            <div className="space-y-3">
              <a
                href="/fortune"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-colors"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-800">Fortune Center</p>
                  <p className="text-sm text-stone-500">Daily/Weekly/Monthly fortune</p>
                </div>
              </a>

              <a
                href="/wish-wall"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl hover:from-pink-100 hover:to-rose-100 transition-colors"
              >
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-800">My Wishes</p>
                  <p className="text-sm text-stone-500">Make beautiful wishes</p>
                </div>
              </a>

              <a
                href="/user/prayer"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-800">Prayer Center</p>
                  <p className="text-sm text-stone-500">Pray for blessings</p>
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
                  <p className="font-medium text-stone-800">Coin History</p>
                  <p className="text-sm text-stone-500">View transaction records</p>
                </div>
              </a>

              <a
                href="/user/profile"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:from-emerald-100 hover:to-teal-100 transition-colors"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-800">Profile Settings</p>
                  <p className="text-sm text-stone-500">Change avatar, password, etc.</p>
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
                    <p className="font-semibold text-amber-600">-{prayer.points_spent} coins</p>
                  </div>
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
