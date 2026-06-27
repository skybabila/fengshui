'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Heart, Send, Sparkles, Lock, Coins, Trash2, CheckCircle, PartyPopper, Star, Clock } from 'lucide-react'

const WISH_COST = 10

export default function WishWallPage() {
  const [wishes, setWishes] = useState<any[]>([])
  const [newWish, setNewWish] = useState('')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'fulfilled'>('active')

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
          .limit(100)
        
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
          is_fulfilled: false,
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

  const handleFulfillWish = async (wishId: number) => {
    if (!confirm('Have your wish come true? Mark it as fulfilled! 🎉')) return

    try {
      const { error } = await supabase
        .from('wishes')
        .update({ 
          is_fulfilled: true,
          fulfilled_at: new Date().toISOString()
        })
        .eq('id', wishId)

      if (error) {
        alert('Failed to mark as fulfilled: ' + error.message)
        return
      }

      setWishes(wishes.map((w: any) => 
        w.id === wishId 
          ? { ...w, is_fulfilled: true, fulfilled_at: new Date().toISOString() }
          : w
      ))
    } catch (error) {
      console.error('Error fulfilling wish:', error)
      alert('Failed to mark as fulfilled')
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

  const activeWishes = wishes.filter((w: any) => !w.is_fulfilled)
  const fulfilledWishes = wishes.filter((w: any) => w.is_fulfilled)

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
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
            <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  const displayWishes = activeTab === 'active' ? activeWishes : fulfilledWishes

  return (
    <SidebarLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">My Wish Wall</h1>
            <p className="text-stone-500">Record your beautiful wishes and find spiritual comfort</p>
          </div>

          {/* Stats & Coins */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm text-stone-500">My Coins</p>
              <p className="text-xl font-bold text-amber-600">{profile?.points || 0}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <p className="text-sm text-stone-500">Wishing</p>
              <p className="text-xl font-bold text-pink-600">{activeWishes.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <PartyPopper className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-sm text-stone-500">Fulfilled</p>
              <p className="text-xl font-bold text-emerald-600">{fulfilledWishes.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-100 mb-6 overflow-hidden">
            <div className="flex border-b border-stone-100">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'active'
                    ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50/50'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                Wishing ({activeWishes.length})
              </button>
              <button
                onClick={() => setActiveTab('fulfilled')}
                className={`flex-1 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'fulfilled'
                    ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Fulfilled ({fulfilledWishes.length})
              </button>
            </div>

            {/* Wish List */}
            <div className="p-6">
              {displayWishes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayWishes.map((wish: any, index: number) => (
                    <div
                      key={wish.id}
                      className={`relative border rounded-xl p-5 shadow-sm hover:shadow-md transition-all ${
                        wish.is_fulfilled
                          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
                          : `bg-gradient-to-br ${getRandomColor()}`
                      }`}
                    >
                      {wish.is_fulfilled && (
                        <div className="absolute -top-2 -right-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                            <PartyPopper className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-stone-700 pr-6 font-medium">{wish.content}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">
                          {profile?.nickname || profile?.name || user?.email?.split('@')[0] || 'Me'}
                        </span>
                        <span className="text-stone-400 text-xs">
                          {wish.is_fulfilled && wish.fulfilled_at
                            ? `Fulfilled: ${formatDate(wish.fulfilled_at)}`
                            : formatDate(wish.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/50">
                        {!wish.is_fulfilled && (
                          <button
                            onClick={() => handleFulfillWish(wish.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50 rounded-lg transition-colors text-sm font-medium"
                            title="Mark as fulfilled"
                          >
                            <Star className="w-4 h-4" />
                            Fulfilled
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteWish(wish.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-white/50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  {activeTab === 'active' ? (
                    <>
                      <Heart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-500 mb-2">No wishes yet</p>
                      <p className="text-stone-400 text-sm">Make your first wish below!</p>
                    </>
                  ) : (
                    <>
                      <PartyPopper className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-500 mb-2">No fulfilled wishes yet</p>
                      <p className="text-stone-400 text-sm">May your wishes come true soon! ✨</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Make a Wish */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-stone-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-800">Make a New Wish</h2>
                <p className="text-sm text-stone-500">Costs {WISH_COST} coins per wish</p>
              </div>
            </div>
            
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
                    disabled={!newWish.trim() || posting || (profile?.points || 0) < WISH_COST}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {posting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Wishing...
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
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
        </div>
      </div>
    </SidebarLayout>
  )
}
