'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Heart, Send, Sparkles, Lock, Coins, Trash2 } from 'lucide-react'

const WISH_COST = 10

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
        if (!authUser) {
          window.location.href = '/login'
          return
        }
        setUser(authUser)
        const userProfile = await getUserProfile(authUser.id)
        setProfile(userProfile)

        const { data: wishData } = await supabase
          .from('wishes')
          .select('*')
          .eq('user_id', authUser.id)
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
        alert('Please log in to make a wish')
      }
      return
    }

    if (newWish.length > 200) {
      alert('Wish content is too long, please keep it under 200 characters')
      return
    }

    const points = profile?.points || 0
    if (points < WISH_COST) {
      alert(`Not enough coins! Making a wish costs ${WISH_COST} coins, you have ${points} coins`)
      return
    }

    setPosting(true)

    try {
      await supabase
        .from('user_profiles')
        .update({ points: points - WISH_COST })
        .eq('id', user.id)

      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          description: 'Wish cost',
          points: -WISH_COST
        })

      const { data: newWishData } = await supabase
        .from('wishes')
        .insert({
          user_id: user.id,
          content: newWish.trim(),
          is_public: false,
        })
        .select()
        .single()

      if (newWishData) {
        setWishes([newWishData, ...wishes])
        setNewWish('')
        const updatedProfile = await getUserProfile(user.id)
        setProfile(updatedProfile)
      }
    } catch (error) {
      console.error('Error posting wish:', error)
      alert('Failed to make a wish, please try again later')
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteWish = async (wishId: number) => {
    if (!confirm('Are you sure you want to delete this wish?')) return
    
    try {
      await supabase
        .from('wishes')
        .delete()
        .eq('id', wishId)
      
      setWishes(wishes.filter(w => w.id !== wishId))
    } catch (error) {
      console.error('Error deleting wish:', error)
      alert('Delete failed')
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
          <h1 className="text-3xl font-bold text-stone-800 mb-2">My Wish Wall</h1>
          <p className="text-stone-500">Record your beautiful wishes and find spiritual comfort</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">My Coins</p>
              <p className="text-xl font-bold text-amber-600">{profile?.points || 0}</p>
            </div>
          </div>
          <div className="text-sm text-stone-500">
            Wish cost: <span className="text-amber-600 font-semibold">{WISH_COST} coins</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Make a New Wish</h2>
          {user ? (
            <>
              <textarea
                value={newWish}
                onChange={(e) => setNewWish(e.target.value)}
                placeholder="Write your wish... (max 200 characters)"
                maxLength={200}
                className="w-full p-4 border border-stone-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none h-32"
              />
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-stone-400">{newWish.length}/200</span>
                <button
                  onClick={handlePostWish}
                  disabled={!newWish.trim() || posting || (profile?.points || 0) < WISH_COST}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {posting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Wishing...
                    </span>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Make a Wish ({WISH_COST} coins)
                    </>
                  )}
                </button>
              </div>
              {(profile?.points || 0) < WISH_COST && (
                <p className="mt-3 text-sm text-red-500">
                  Not enough coins to make a wish. Please visit the profile center to see how to get more coins.
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 bg-stone-50 rounded-xl">
              <Lock className="w-12 h-12 text-stone-400 mb-4" />
              <p className="text-stone-500 mb-2">Please log in to make a wish</p>
              <a href="/login" className="text-pink-600 font-medium hover:underline">
                Login / Register
              </a>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-stone-600">{wishes.length} wishes made</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishes.map((wish: any, index) => (
            <div
              key={wish.id}
              className={`bg-gradient-to-br ${getRandomColor()} border rounded-xl p-5 shadow-sm hover:shadow-md transition-all animate-fade-in-up relative`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                onClick={() => handleDeleteWish(wish.id)}
                className="absolute top-2 right-2 p-1.5 text-stone-400 hover:text-red-500 hover:bg-white/50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <p className="text-stone-700 mb-3 pr-6">{wish.content}</p>
              <div className="flex items-center justify-between text-sm text-stone-500">
                <span>
                  {profile?.nickname || profile?.name || user?.email?.split('@')[0] || 'Me'}
                </span>
                <span>{formatDate(wish.created_at)}</span>
              </div>
            </div>
          ))}
        </div>

        {wishes.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">No wishes yet, make your first wish!</p>
          </div>
        )}
      </div>
    </div>
  )
}
