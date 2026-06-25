'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, ADMIN_EMAIL } from '@/lib/supabase'
import { ArrowLeft, Save, Eye, Pin } from 'lucide-react'
import ImageUploader from '@/components/ImageUploader'
import RichTextEditor from '@/components/RichTextEditor'

const categories = ['Feng Shui', 'Fortune', 'Wellness', 'History', 'Philosophy']

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Feng Shui',
    image: '',
    author: 'Master Li',
    status: 'draft',
    is_pinned: false,
  })

  useEffect(() => {
    async function fetchArticle() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.email !== ADMIN_EMAIL) {
          window.location.href = '/login'
          return
        }

        const { data, error: fetchError } = await supabase
          .from('articles')
          .select('*')
          .eq('id', parseInt(id))
          .single()

        if (fetchError || !data) {
          router.push('/admin/articles')
          return
        }

        setForm({
          title: data.title || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          category: data.category || 'Feng Shui',
          image: data.image || '',
          author: data.author || 'Master Li',
          status: data.status || 'draft',
          is_pinned: data.is_pinned || false,
        })
      } catch {
        router.push('/admin/articles')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id, router])

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent, publishAfter = false) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: publishAfter ? 'published' : form.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update article')
      } else {
        router.push('/admin/articles')
      }
    } catch {
      setError('An error occurred')
    } finally {
      setSaving(false)
    }
  }

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
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/articles" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-1">Edit Article</h1>
          <p className="text-stone-500 mb-6">Editing article #{id}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-medium"
                placeholder="Enter article title"
              />
            </div>

            {/* Category & Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Author</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => handleChange('author', e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Author name"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <ImageUploader
                value={form.image}
                onChange={(url) => handleChange('image', url)}
                bucket="articles"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Excerpt (Short Description)</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder="Brief description for article preview"
              />
            </div>

            {/* Rich Text Content */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Content</label>
              <RichTextEditor
                value={form.content}
                onChange={(content) => handleChange('content', content)}
                placeholder="Write your article content here..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={form.status === 'draft'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-stone-700">Draft</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={form.status === 'published'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-stone-700">Published</span>
                </label>
              </div>
            </div>

            {/* Pin */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.is_pinned}
                  onChange={(e) => setForm(prev => ({ ...prev, is_pinned: e.target.checked }))}
                  className="w-5 h-5 text-amber-600 focus:ring-amber-500 rounded border-stone-300"
                />
                <div className="flex items-center gap-2">
                  <Pin className="w-5 h-5 text-amber-500" />
                  <span className="text-stone-700 font-medium group-hover:text-amber-600 transition-colors">Pin to Top</span>
                </div>
                <span className="text-xs text-stone-400 ml-2">(Pinned articles will be displayed first on the homepage)</span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-stone-100">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
              >
                <Eye className="w-5 h-5" />
                {saving ? 'Publishing...' : 'Publish Now'}
              </button>
              <Link
                href="/admin/articles"
                className="px-6 py-3 text-stone-600 hover:text-stone-800 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
