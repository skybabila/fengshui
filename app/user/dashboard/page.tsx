'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import {
  Coins, Calendar, Star, TrendingUp, Award, Activity, Settings, Heart,
  Sparkles, Zap, Gift, Shield, ChevronRight, Clock, Crown, Flame
} from 'lucide-react'

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
  const userName = profile?.nickname || profile?.name || user?.email?.split('@')[0]

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
      case 'Great Fortune': return 'from-green-500 to-emerald-600'
      case 'Good Fortune': return 'from-emerald-500 to-teal-600'
      case 'Moderate Fortune': return 'from-amber-500 to-orange-500'
      case 'Small Fortune': return 'from-orange-500 to-red-500'
      case 'Average': return 'from-gray-500 to-slate-500'
      default: return 'from-green-500 to-emerald-600'
    }
  }

  const getFortuneLightBg = (type: string) => {
    switch (type) {
      case 'Great Fortune': return 'bg-green-50 border-green-100'
      case 'Good Fortune': return 'bg-emerald-50 border-emerald-100'
      case 'Moderate Fortune': return 'bg-amber-50 border-amber-100'
      case 'Small Fortune': return 'bg-orange-50 border-orange-100'
      case 'Average': return 'bg-gray-50 border-gray-100'
      default: return 'bg-green-50 border-green-100'
    }
  }

  const features = [
    {
      icon: Sparkles,
      title: 'Daily Fortune',
      desc: 'Unlock your daily luck',
      href: '/fortune/daily',
      cost: '5 coins',
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
    },
    {
      icon: Star,
      title: 'Weekly Fortune',
      desc: 'Plan your week ahead',
      href: '/fortune/weekly',
      cost: '20 coins',
      gradient: 'from-purple-500 to-indigo-500',
      bgGradient: 'from-purple-50 to-indigo-50',
    },
    {
      icon: Crown,
      title: 'Monthly Fortune',
      desc: 'Detailed monthly forecast',
      href: '/fortune/monthly',
      cost: '50 coins',
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-50 to-blue-50',
    },
    {
      icon: Heart,
      title: 'Wish Wall',
      desc: 'Make your wishes come true',
      href: '/wish-wall',
      cost: '10 coins',
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-50 to-rose-50',
    },
    {
      icon: Flame,
      title: 'Prayer Center',
      desc: 'Pray for blessings',
      href: '/user/prayer',
      cost: 'Varies',
      gradient: 'from-red-500 to-orange-500',
      bgGradient: 'from-red-50 to-orange-50',
    },
    {
      icon: Gift,
      title: 'Earn Coins',
      desc: 'Get more free coins',
      href: '/user/points',
      cost: 'Free',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
    },
  ]

  return (
    <SidebarLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👋</span>
              <p className="text-emerald-100 text-sm">Welcome back</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Hello, {userName}!</h1>
            <p className="text-emerald-100 mb-6 max-w-lg">
              Explore your fortune, make wishes, and pray for blessings. May good luck be with you today!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/fortune/daily"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Get Daily Fortune
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/user/points"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/30 transition-all border border-white/30"
              >
                <Gift className="w-5 h-5" />
                Earn Free Coins
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-stone-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-stone-500 text-sm">My Coins</p>
            <p className="text-2xl font-bold text-stone-800">{points.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-stone-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-stone-500 text-sm">Daily Fortune</p>
            <p className="text-2xl font-bold text-stone-800">
              {dailyFortune ? 'Done' : 'New'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-stone-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <p className="text-stone-500 text-sm">Prayers</p>
            <p className="text-2xl font-bold text-stone-800">{recentPrayers.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-stone-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-500" />
              </div>
            </div>
            <p className="text-stone-500 text-sm">Wishes</p>
            <p className="text-2xl font-bold text-stone-800">{wishCount}</p>
          </div>
        </div>

        {/* Fortune Today Card */}
        <div className={`rounded-3xl p-6 mb-8 border-2 ${getFortuneLightBg(dailyFortune?.fortune_type || '')}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-stone-800">Today&rsquo;s Fortune</h2>
            </div>
            <Link href="/fortune" className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {dailyFortune ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getFortuneBgClass(dailyFortune.fortune_type)} flex items-center justify-center shadow-lg`}>
                <span className="text-4xl">{getFortuneEmoji(dailyFortune.fortune_type)}</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-stone-800 mb-2">{dailyFortune.fortune_type}</h3>
                <p className="text-stone-600 mb-3">{dailyFortune.description}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-stone-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(dailyFortune.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Zodiac: {dailyFortune.zodiac_sign}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-stone-100 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-stone-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-stone-700 mb-2">Fortune Not Yet Unlocked</h3>
                <p className="text-stone-500 mb-4">Get your personalized fortune reading for today and start your day with confidence!</p>
                <a
                  href="/fortune/daily"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Unlock Now - 5 coins
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Feature Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-stone-800">Explore Features</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Link
                  key={index}
                  href={feature.href}
                  className="group bg-white rounded-2xl p-5 shadow-lg border border-stone-100 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-stone-800 mb-1">{feature.title}</h3>
                  <p className="text-sm text-stone-500 mb-3">{feature.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                      {feature.cost}
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Prayers */}
          {recentPrayers.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-500" />
                  <h2 className="text-lg font-bold text-stone-800">Recent Prayers</h2>
                </div>
                <a href="/user/prayer" className="text-sm text-cyan-600 font-medium hover:text-cyan-700">
                  View all
                </a>
              </div>
              <div className="space-y-3">
                {recentPrayers.slice(0, 3).map((prayer: any) => (
                  <div key={prayer.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
                    <div>
                      <p className="font-medium text-stone-800">{prayer.prayer_type}</p>
                      <p className="text-xs text-stone-500">{formatDate(prayer.created_at)}</p>
                    </div>
                    <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                      -{prayer.points_spent}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-stone-800">Daily Tips</h2>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-violet-500 mt-0.5">✨</span>
                <p className="text-sm text-stone-600">Check your daily fortune every morning to plan your day better</p>
              </div>
              <div className="flex gap-3">
                <span className="text-violet-500 mt-0.5">🎁</span>
                <p className="text-sm text-stone-600">Complete your profile to get 100 free coins bonus</p>
              </div>
              <div className="flex gap-3">
                <span className="text-violet-500 mt-0.5">🙏</span>
                <p className="text-sm text-stone-600">Pray sincerely and your wishes may come true</p>
              </div>
            </div>
            <a
              href="/articles"
              className="mt-5 inline-flex items-center gap-2 text-violet-600 font-medium text-sm hover:text-violet-700"
            >
              Read more articles <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
