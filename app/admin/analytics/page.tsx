'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, ADMIN_EMAIL } from '@/lib/supabase'
import {
  Users, BookOpen, Star, Heart, TrendingUp, ArrowLeft, Activity,
  Calendar, Coins, Eye, RefreshCw
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    totalWishes: 0,
    totalPrayers: 0,
    totalFortunes: 0,
    totalPoints: 0,
    todayUsers: 0,
    todayFortunes: 0,
    todayPrayers: 0,
    weeklyUsers: 0,
    weeklyFortunes: 0,
    weeklyPrayers: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState('today')

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser || authUser.email !== ADMIN_EMAIL) {
          window.location.href = '/login'
          return
        }

        const today = new Date().toISOString().split('T')[0]
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const [
          { data: users },
          { data: articles },
          { data: wishes },
          { data: prayers },
          { data: fortunes },
        ] = await Promise.all([
          supabase.from('user_profiles').select('*'),
          supabase.from('articles').select('*'),
          supabase.from('wishes').select('*'),
          supabase.from('prayers').select('*'),
          supabase.from('daily_fortunes').select('*'),
        ])

        const totalPoints = users?.reduce((sum, u) => sum + (u.points || 0), 0) || 0
        const todayUsers = users?.filter(u => u.created_at?.startsWith(today)).length || 0
        const todayFortunes = fortunes?.filter(f => f.created_at?.startsWith(today)).length || 0
        const todayPrayers = prayers?.filter(p => p.created_at?.startsWith(today)).length || 0
        const weeklyUsers = users?.filter(u => u.created_at >= weekAgo).length || 0
        const weeklyFortunes = fortunes?.filter(f => f.created_at >= weekAgo).length || 0
        const weeklyPrayers = prayers?.filter(p => p.created_at >= weekAgo).length || 0

        setStats({
          totalUsers: users?.length || 0,
          totalArticles: articles?.length || 0,
          totalWishes: wishes?.length || 0,
          totalPrayers: prayers?.length || 0,
          totalFortunes: fortunes?.length || 0,
          totalPoints,
          todayUsers,
          todayFortunes,
          todayPrayers,
          weeklyUsers,
          weeklyFortunes,
          weeklyPrayers,
        })

        // Build recent activity feed
        const activities: any[] = []
        users?.slice(0, 5).forEach(u => {
          activities.push({
            type: 'user',
            text: `${u.name || u.email} joined`,
            time: u.created_at,
            icon: '👤',
          })
        })
        prayers?.slice(0, 5).forEach(p => {
          activities.push({
            type: 'prayer',
            text: `Prayer: ${p.prayer_type}`,
            time: p.created_at,
            icon: '🙏',
          })
        })
        fortunes?.slice(0, 5).forEach(f => {
          activities.push({
            type: 'fortune',
            text: `Fortune: ${f.fortune_type}`,
            time: f.created_at,
            icon: '🔮',
          })
        })
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        setRecentActivity(activities.slice(0, 15))

      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <Activity className="w-8 h-8 text-cyan-500" />
          </div>
          <h2 className="text-xl font-semibold text-stone-700">Loading Analytics...</h2>
        </div>
      </div>
    )
  }

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-stone-500 text-sm font-medium">{title}</p>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-3xl font-bold text-stone-800">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-stone-400 mt-2">{sub}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-stone-800">Analytics</h1>
            <p className="text-stone-500 mt-1">Comprehensive site statistics and insights</p>
          </div>
          <div className="flex items-center gap-2">
            {['today', 'week', 'all'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  timeRange === range
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'All Time'}
              </button>
            ))}
            <button
              onClick={() => window.location.reload()}
              className="ml-2 p-3 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            User Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-100 text-blue-600" />
            <StatCard title="New Today" value={stats.todayUsers} icon={TrendingUp} color="bg-green-100 text-green-600" sub="+{stats.todayUsers} today" />
            <StatCard title="New This Week" value={stats.weeklyUsers} icon={Calendar} color="bg-purple-100 text-purple-600" />
            <StatCard title="Total Points" value={stats.totalPoints} icon={Coins} color="bg-amber-100 text-amber-600" />
          </div>
        </div>

        {/* Content Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Content Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Articles" value={stats.totalArticles} icon={BookOpen} color="bg-emerald-100 text-emerald-600" />
            <StatCard title="Wishes" value={stats.totalWishes} icon={Star} color="bg-yellow-100 text-yellow-600" />
            <StatCard title="Prayers" value={stats.totalPrayers} icon={Heart} color="bg-red-100 text-red-600" />
            <StatCard title="Fortunes" value={stats.totalFortunes} icon={Eye} color="bg-cyan-100 text-cyan-600" />
          </div>
        </div>

        {/* Activity Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            Today&apos;s Activity
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard title="Fortunes Today" value={stats.todayFortunes} icon={Eye} color="bg-cyan-100 text-cyan-600" />
            <StatCard title="Prayers Today" value={stats.todayPrayers} icon={Heart} color="bg-pink-100 text-pink-600" />
            <StatCard title="New Users Today" value={stats.todayUsers} icon={Users} color="bg-blue-100 text-blue-600" />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart (Simple Bar) */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-stone-800 mb-6">User Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-600">Total Users</span>
                  <span className="font-semibold text-stone-800">{stats.totalUsers}</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-600">Articles</span>
                  <span className="font-semibold text-stone-800">{stats.totalArticles}</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${Math.min(100, (stats.totalArticles / Math.max(1, stats.totalUsers)) * 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-600">Wishes</span>
                  <span className="font-semibold text-stone-800">{stats.totalWishes}</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-3">
                  <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${Math.min(100, (stats.totalWishes / Math.max(1, stats.totalUsers)) * 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-600">Prayers</span>
                  <span className="font-semibold text-stone-800">{stats.totalPrayers}</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-3">
                  <div className="bg-pink-500 h-3 rounded-full" style={{ width: `${Math.min(100, (stats.totalPrayers / Math.max(1, stats.totalUsers)) * 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-600">Fortunes</span>
                  <span className="font-semibold text-stone-800">{stats.totalFortunes}</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-3">
                  <div className="bg-cyan-500 h-3 rounded-full" style={{ width: `${Math.min(100, (stats.totalFortunes / Math.max(1, stats.totalUsers)) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-stone-800 mb-6">Engagement Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-50 rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalUsers > 0 ? ((stats.totalFortunes / stats.totalUsers)).toFixed(1) : '0'}
                </p>
                <p className="text-sm text-stone-500 mt-1">Fortunes/User</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-pink-600">
                  {stats.totalUsers > 0 ? ((stats.totalPrayers / stats.totalUsers)).toFixed(1) : '0'}
                </p>
                <p className="text-sm text-stone-500 mt-1">Prayers/User</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-amber-600">
                  {stats.totalUsers > 0 ? Math.round(stats.totalPoints / stats.totalUsers).toLocaleString() : '0'}
                </p>
                <p className="text-sm text-stone-500 mt-1">Avg Points/User</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-emerald-600">
                  {stats.totalUsers > 0 ? ((stats.totalWishes / stats.totalUsers)).toFixed(1) : '0'}
                </p>
                <p className="text-sm text-stone-500 mt-1">Wishes/User</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl">
                  <span className="text-xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-stone-700">{activity.text}</p>
                  </div>
                  <span className="text-xs text-stone-400">
                    {new Date(activity.time).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">No recent activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}