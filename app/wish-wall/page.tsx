'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Heart, Send, Sparkles, Lock } from 'lucide-react'

export default function WishWallPage() {
  const [wishes, setWishes] = useState<any[]>([])
  const [newWish, setNewWish] = useState('')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser(authUser)
          const userProfile = await getUserProfile(authUser.id)
          setProfile(userProfile)
        }

        const { data: wishData } = await supabase
          .from('wishes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        
        setWishes(wishData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePostWish = async () => {
    if (!newWish.trim() || !user) {
      if (!user) {
        alert('Please sign in to post a wish')
      }
      return
    }

    if (newWish.length > 200) {
      alert('Wish is too long. Please keep it under 200 characters.')
      return
    }

    setPosting(true)

    try {
      const { data: newWishData } = await supabase
        .from('wishes')
        .insert({
          user_id: user.id,
          content: newWish.trim(),
          is_public: true,
        })
        .select()
        .single()

      if (newWishData) {
        setWishes([newWishData, ...wishes])
        setNewWish('')
      }
    } catch (error) {
      console.error('Error posting wish:', error)
    } finally {
      setPosting(false)
    }
  }

  const getRandomColor = () => {
    const colors = [
      'from-pink-100 to-rose-100 border-pink-200',
      'from-purple-100 to-violet-100 border-purple-200',
      'from-blue-100 to-cyan-100 border-blue-200',
      'from-emerald-100 to-teal-100 border-emerald-200',
      'from-amber-100 to-orange-100 border-amber-200',
      'from-red-100 to-pink-100 border-red-200',
      'from-indigo-100 to-purple-100 border-indigo-200',
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Wish Wall</h1>
          <p className="text-stone-500">Share your wishes with the community</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Post a Wish</h2>
          {user ? (
            <>
              <textarea
                value={newWish}
                onChange={(e) => setNewWish(e.target.value)}
                placeholder="Write your wish here... (max 200 characters)"
                maxLength={200}
                className="w-full p-4 border border-stone-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none h-32"
              />
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-stone-400">{newWish.length}/200</span>
                <button
                  onClick={handlePostWish}
                  disabled={!newWish.trim() || posting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {posting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Posting...
                    </span>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Wish
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 bg-stone-50 rounded-xl">
              <Lock className="w-12 h-12 text-stone-400 mb-4" />
              <p className="text-stone-500 mb-2">Sign in to post a wish</p>
              <a href="/login" className="text-pink-600 font-medium hover:underline">
                Sign In / Register
              </a>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-stone-600">{wishes.length} wishes shared</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishes.map((wish: any, index) => (
            <div
              key={wish.id}
              className={`bg-gradient-to-br ${getRandomColor()} border rounded-xl p-5 shadow-sm hover:shadow-md transition-all animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <p className="text-stone-700 mb-3">{wish.content}</p>
              <div className="flex items-center justify-between text-sm text-stone-500">
                <span>
                  {wish.user_name || 'Anonymous'}
                </span>
                <span>{formatDate(wish.created_at)}</span>
              </div>
            </div>
          ))}
        </div>

        {wishes.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">No wishes yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  )
}
