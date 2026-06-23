'use client'

import { useState, useEffect } from 'react'
import { supabase, ADMIN_EMAIL } from '@/lib/supabase'
import { Users, Coins, Calendar, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPrayers: 0,
    totalPoints: 0,
    todayUsers: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser || authUser.email !== ADMIN_EMAIL) {
          window.location.href = '/login'
          return
        }
        setUser(authUser)

        const { data: users } = await supabase.from('user_profiles').select('*')
        const { data: prayers } = await supabase.from('prayers').select('*')

        const totalPoints = users?.reduce((sum: number, u: any) => sum + (u.points || 0), 0) || 0
        
        const today = new Date().toISOString().split('T')[0]
        const todayUsers = users?.filter((u: any) => u.created_at?.startsWith(today)).length || 0

        setStats({
          totalUsers: users?.length || 0,
          totalPrayers: prayers?.length || 0,
          totalPoints,
          todayUsers,
        })

        const recent = users?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
        setRecentUsers(recent || [])
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-2xl">☯</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">Admin Dashboard</h1>
            <p className="text-stone-500 mt-1">Welcome back, Admin</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-500 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-stone-800 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+{stats.todayUsers} today</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-500 text-sm">Total Prayers</p>
                <p className="text-3xl font-bold text-stone-800 mt-2">{stats.totalPrayers}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12% this week</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-500 text-sm">Total Points</p>
                <p className="text-3xl font-bold text-stone-800 mt-2">{stats.totalPoints.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+8% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-500 text-sm">Today&apos;s Users</p>
                <p className="text-3xl font-bold text-stone-800 mt-2">{stats.todayUsers}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+{stats.todayUsers > 0 ? stats.todayUsers : 0} from yesterday</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Recent Users</h2>
            <div className="space-y-3">
              {recentUsers.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-stone-600 font-semibold">
                        {u.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{u.name || u.email}</p>
                      <p className="text-sm text-stone-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-600">{u.points || 0} pts</p>
                    <p className="text-xs text-stone-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a href="/admin/users" className="block p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-800">Manage Users</p>
                    <p className="text-sm text-stone-500">View and manage all users</p>
                  </div>
                </div>
              </a>

              <a href="/admin/analytics" className="block p-4 bg-cyan-50 rounded-xl hover:bg-cyan-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-800">Analytics</p>
                    <p className="text-sm text-stone-500">View site statistics</p>
                  </div>
                </div>
              </a>

              <a href="/admin/content" className="block p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-800">Content Management</p>
                    <p className="text-sm text-stone-500">Manage articles and content</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
