'use client'

import { useState, useEffect } from 'react'
import { supabase, ADMIN_EMAIL } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Users, Trash2, Search, RefreshCw, Eye, Coins, Plus, Minus, X, Check } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [adjustingUser, setAdjustingUser] = useState<any>(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [adjusting, setAdjusting] = useState(false)

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
        <div className="max-w-6xl">
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
    </SidebarLayout>
  )
}
