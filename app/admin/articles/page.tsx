'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, ADMIN_EMAIL } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Plus, Edit, Trash2, Eye, Search, RefreshCw, BookOpen, ArrowLeft, ArrowUp, ArrowDown, Globe, Lock, Pin } from 'lucide-react'

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'title'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser || authUser.email !== ADMIN_EMAIL) {
          window.location.href = '/login'
          return
        }

        const response = await fetch(`/api/articles?status=all&limit=100`)
        const data = await response.json()
        
        if (response.ok && data.articles) {
          let sorted = [...data.articles]
          sorted.sort((a: any, b: any) => {
            const aVal = a[sortBy] || ''
            const bVal = b[sortBy] || ''
            if (sortOrder === 'asc') {
              return aVal > bVal ? 1 : -1
            }
            return aVal < bVal ? 1 : -1
          })
          setArticles(sorted)
        }
      } catch (error) {
        console.error('Error fetching articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [sortBy, sortOrder])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return
    setDeletingId(id)

    try {
      const response = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setArticles(articles.filter(a => a.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete')
      }
    } catch {
      alert('Error deleting article')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    setTogglingId(id)
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setArticles(articles.map(a => a.id === id ? { ...a, status: newStatus } : a))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update status')
      }
    } catch {
      alert('Error updating status')
    } finally {
      setTogglingId(null)
    }
  }

  const handleSort = (column: 'created_at' | 'updated_at' | 'title') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const SortIcon = ({ column }: { column: string }) => (
    sortBy === column ? (
      sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
    ) : null
  )

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
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
      <div className="p-8">
        <div className="max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-stone-800">Article Management</h1>
              <p className="text-stone-500 mt-1">Create, edit, and manage your articles</p>
            </div>
            <Link
              href="/admin/articles/new"
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-200 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Article
            </Link>
          </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'published', 'draft'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    statusFilter === s
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
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

          {/* Sort Options */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-100">
            <span className="text-sm text-stone-500">Sort by:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSort('created_at')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  sortBy === 'created_at' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                Date Created <SortIcon column="created_at" />
              </button>
              <button
                onClick={() => handleSort('updated_at')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  sortBy === 'updated_at' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                Last Modified <SortIcon column="updated_at" />
              </button>
              <button
                onClick={() => handleSort('title')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  sortBy === 'title' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                Title <SortIcon column="title" />
              </button>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="text-left py-4 px-6 font-semibold text-stone-700">Article</th>
                  <th className="text-left py-4 px-6 font-semibold text-stone-700">Category</th>
                  <th className="text-center py-4 px-4 font-semibold text-stone-700">Pinned</th>
                  <th className="text-left py-4 px-6 font-semibold text-stone-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-stone-700">Author</th>
                  <th className="text-left py-4 px-6 font-semibold text-stone-700">Date</th>
                  <th className="text-right py-4 px-6 font-semibold text-stone-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {article.image ? (
                          <img src={article.image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-6 h-6 text-emerald-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-stone-800 line-clamp-1">{article.title}</p>
                          <p className="text-sm text-stone-400 line-clamp-1">{article.excerpt?.substring(0, 50)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">
                        {article.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {article.is_pinned ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full">
                          <Pin className="w-4 h-4 text-amber-600" />
                        </div>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(article.id, article.status)}
                        disabled={togglingId === article.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all disabled:opacity-50 ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        {togglingId === article.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : article.status === 'published' ? (
                          <Globe className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                        {article.status === 'published' ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-stone-600">{article.author || 'Master Li'}</td>
                    <td className="py-4 px-6 text-stone-500 text-sm">
                      <div>{formatDate(article.created_at)}</div>
                      <div className="text-xs text-stone-400">Modified: {formatDate(article.updated_at)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/articles/${article.id}`}
                          target="_blank"
                          className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id)}
                          disabled={deletingId === article.id}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === article.id ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredArticles.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500 mb-4">No articles found</p>
                <Link
                  href="/admin/articles/new"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Article
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-2xl font-bold text-stone-800">{articles.length}</p>
            <p className="text-sm text-stone-500">Total Articles</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-2xl font-bold text-green-600">{articles.filter(a => a.status === 'published').length}</p>
            <p className="text-sm text-stone-500">Published</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-2xl font-bold text-amber-600">{articles.filter(a => a.status === 'draft').length}</p>
            <p className="text-sm text-stone-500">Drafts</p>
          </div>
        </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
