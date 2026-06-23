'use client'

import { useState, useEffect } from 'react'
import { supabase, ADMIN_EMAIL } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Users, Trash2, Search, RefreshCw, Eye } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
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

  const filteredUsers = users.filter((u: any) => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h1 className="text-3xl font-bold text-stone-800">Manage Users</h1>
            <p className="text-stone-500 mt-1">View and manage all registered users</p>
          </div>
          <a href="/admin/dashboard" className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
            Back to Dashboard
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
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
              onClick={() => window.location.reload()}
              className="ml-4 flex items-center gap-2 px-4 py-3 bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 transition-colors"
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
                            {user.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <span className="font-medium text-stone-800">{user.name || 'N/A'}</span>
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
                    <td className="py-4 px-4 text-right font-semibold text-amber-600">{user.points || 0}</td>
                    <td className="py-4 px-4 text-stone-500 text-sm">{formatDate(user.created_at)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="View details">
                          <Eye className="w-5 h-5" />
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
  )
}
