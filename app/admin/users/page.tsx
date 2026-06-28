'use client'

import { useState, useEffect } from 'react'
import { supabase, ADMIN_EMAIL } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Users, Trash2, Search, RefreshCw, Eye, Coins, Plus, Minus, X, Check, Heart, Sparkles, PartyPopper, Clock } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [adjustingUser, setAdjustingUser] = useState<any>(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [viewWishesUser, setViewWishesUser] = useState<any>(null)
  const [userWishes, setUserWishes] = useState<any[]>([])
  const [wishesLoading, setWishesLoading] = useState(false)
  const [wishTab, setWishTab] = useState<'all' | 'active' | 'fulfilled'>('all')

  const fetchUsers = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser || authUser.email !== ADMIN_EMAIL) {
        window.location.href = '/login'
        return
      }

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      setUsers(profiles || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUserWishes = async (userId: string) => {
    setWishesLoading(true)
    try {
      const { data: wishes, error } = await supabase
        .from('wishes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) {
        console.error('Error fetching user wishes:', error)
        setUserWishes([])
        return
      }
      
      setUserWishes(wishes || [])
    } catch (error) {
      console.error('Error fetching wishes:', error)
      setUserWishes([])
    } finally {
      setWishesLoading(false)
    }
  }

  const handleViewWishes = (user: any) => {
    setViewWishesUser(user)
    setWishTab('all')
    fetchUserWishes(user.id)
  }

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return

    setDeletingId(userId)

    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to delete user')
      } else {
        setUsers(users.filter((u: any) => u.id !== userId))
      }
    } catch (error) {
      alert('Error deleting user')
    } finally {
      setDeletingId(null)
    }
  }

  const handleAdjustPoints = async (type: 'add' | 'subtract') => {
    if (!adjustingUser || !adjustAmount) return

    const amount = parseInt(adjustAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive number')
      return
    }

    const finalAmount = type === 'add' ? amount : -amount

    setAdjusting(true)

    try {
      const currentPoints = adjustingUser.points || 0
      const newPoints = currentPoints + finalAmount

      if (newPoints < 0) {
        alert('Insufficient points to deduct')
        return
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ points: newPoints })
        .eq('id', adjustingUser.id)

      if (error) {
        alert('Adjustment failed: ' + error.message)
        return
      }

      await supabase
        .from('point_transactions')
        .insert({
          user_id: adjustingUser.id,
          description: `${type === 'add' ? 'Admin bonus' : 'Admin deduction'}${adjustReason ? ` - ${adjustReason}` : ''}`,
          points: finalAmount
        })

      setUsers(users.map((u: any) => 
        u.id === adjustingUser.id 
          ? { ...u, points: newPoints }
          : u
      ))

      alert(`Points ${type === 'add' ? 'added' : 'deducted'} successfully!`)
      setAdjustingUser(null)
      setAdjustAmount('')
      setAdjustReason('')
    } catch (error: any) {
      console.error('Error adjusting points:', error)
      alert('Adjustment failed: ' + (error?.message || ''))
    } finally {
      setAdjusting(false)
    }
  }

  const filteredUsers = users.filter((u: any) => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeWishes = userWishes.filter((w: any) => !w.is_fulfilled)
  const fulfilledWishes = userWishes.filter((w: any) => w.is_fulfilled)
  const displayWishes = wishTab === 'active' 
    ? activeWishes 
    : wishTab === 'fulfilled' 
      ? fulfilledWishes 
      : userWishes

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <span className="text-2xl">☯</span>
            </div>
            <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-stone-800">Manage Users</h1>
              <p className="text-stone-500 mt-1">View and manage all registered users</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-xl px-4 py-2 border border-stone-200">
                <span className="text-stone-500 text-sm">Total Users: </span>
                <span className="font-bold text-emerald-600">{users.length}</span>
              </div>
            </div>
          </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-stone-100">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-3 bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-4 px-4 font-semibold text-stone-700">User</th>
                  <th className="text-left py-4 px-4 font-semibold text-stone-700">Email</th>
                  <th className="text-left py-4 px-4 font-semibold text-stone-700">Role</th>
                  <th className="text-right py-4 px-4 font-semibold text-stone-700">Points</th>
                  <th className="text-left py-4 px-4 font-semibold text-stone-700">Joined</th>
                  <th className="text-right py-4 px-4 font-semibold text-stone-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-stone-600 font-semibold">
                            {user.name?.charAt(0) || user.nickname?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-stone-800 block">
                            {user.nickname || user.name || 'N/A'}
                          </span>
                          {user.nickname && user.name && (
                            <span className="text-xs text-stone-400">{user.name}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-stone-600">{user.email}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-bold text-amber-600 text-lg">
                        {(user.points || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-stone-500 text-sm">{formatDate(user.created_at)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewWishes(user)}
                          className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                          title="View wishes"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setAdjustingUser(user)
                            setAdjustAmount('')
                            setAdjustReason('')
                          }}
                          className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Adjust points"
                        >
                          <Coins className="w-5 h-5" />
                        </button>
                        {user.email !== ADMIN_EMAIL && (
                          <button
                            onClick={() => handleDelete(user.id, user.email)}
                            disabled={deletingId === user.id}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete user"
                          >
                            {deletingId === user.id ? (
                              <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">No users found</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Points Adjustment Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Adjust Points</h3>
                    <p className="text-amber-100 text-sm">{adjustingUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAdjustingUser(null)
                    setAdjustAmount('')
                    setAdjustReason('')
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Current Points</span>
                  <span className="text-2xl font-bold text-amber-600">
                    {(adjustingUser.points || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Adjustment Amount
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="Enter points amount"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g., Bonus, Correction, Promotion"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleAdjustPoints('subtract')}
                  disabled={adjusting || !adjustAmount}
                  className="flex items-center justify-center gap-2 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <Minus className="w-5 h-5" />
                  Deduct
                </button>
                <button
                  onClick={() => handleAdjustPoints('add')}
                  disabled={adjusting || !adjustAmount}
                  className="flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {adjusting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Add Points
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Wishes Modal */}
      {viewWishesUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">User Wishes</h3>
                    <p className="text-pink-100 text-sm">
                      {viewWishesUser.nickname || viewWishesUser.name || viewWishesUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setViewWishesUser(null)
                    setUserWishes([])
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="p-6 pb-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-stone-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-stone-800">{userWishes.length}</p>
                  <p className="text-xs text-stone-500">Total Wishes</p>
                </div>
                <div className="bg-pink-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-pink-600">{activeWishes.length}</p>
                  <p className="text-xs text-stone-500">Wishing</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{fulfilledWishes.length}</p>
                  <p className="text-xs text-stone-500">Fulfilled</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 flex gap-2 border-b border-stone-100">
              <button
                onClick={() => setWishTab('all')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  wishTab === 'all'
                    ? 'text-violet-600 border-b-2 border-violet-500'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-1" />
                All
              </button>
              <button
                onClick={() => setWishTab('active')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  wishTab === 'active'
                    ? 'text-pink-600 border-b-2 border-pink-500'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Wishing
              </button>
              <button
                onClick={() => setWishTab('fulfilled')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  wishTab === 'fulfilled'
                    ? 'text-emerald-600 border-b-2 border-emerald-500'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <PartyPopper className="w-4 h-4 inline mr-1" />
                Fulfilled
              </button>
            </div>

            {/* Wish List */}
            <div className="p-6 overflow-y-auto flex-1">
              {wishesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                </div>
              ) : displayWishes.length > 0 ? (
                <div className="space-y-3">
                  {displayWishes.map((wish: any, index: number) => (
                    <div
                      key={wish.id}
                      className={`rounded-xl p-4 border-2 ${
                        wish.is_fulfilled
                          ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
                          : index % 3 === 0
                            ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200'
                            : index % 3 === 1
                              ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200'
                              : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-stone-700 font-medium leading-relaxed">{wish.content}</p>
                          <div className="flex items-center gap-3 mt-3 text-xs text-stone-500">
                            <span>{formatDate(wish.created_at)}</span>
                            {wish.is_fulfilled && wish.fulfilled_at && (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <PartyPopper className="w-3 h-3" />
                                Fulfilled: {formatDate(wish.fulfilled_at)}
                              </span>
                            )}
                          </div>
                        </div>
                        {wish.is_fulfilled && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                              <PartyPopper className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">
                    {wishTab === 'active' 
                      ? 'No active wishes' 
                      : wishTab === 'fulfilled' 
                        ? 'No fulfilled wishes'
                        : 'No wishes yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}
