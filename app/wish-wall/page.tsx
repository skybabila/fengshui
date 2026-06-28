'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Heart, Coins, Plus, Sparkles, CheckCircle, Clock, Star, TrendingUp, Lightbulb, PartyPopper } from 'lucide-react'

const WISH_COST = 10

export default function WishWallPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [wishes, setWishes] = useState<any[]>([])
  const [newWish, setNewWish] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'fulfilled'>('all')
  const [showSuccess, setShowSuccess] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)

  const fetchWishes = useCallback(async (userId: string) => {
    try {
      const { data: wishesData, error } = await supabase
        .from('wishes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error fetching wishes:', error)
        setWishes([])
        return
      }

      setWishes(wishesData || [])
    } catch (err) {
      console.error('Exception fetching wishes:', err)
      setWishes([])
    }
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        setPageError(null)
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          window.location.href = '/login'
          return
        }
        setUser(authUser)

        const userProfile = await getUserProfile(authUser.id)
        setProfile(userProfile)

        await fetchWishes(authUser.id)
      } catch (error) {
        console.error('Error fetching data:', error)
        setPageError('Failed to load page. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fetchWishes])

  const points = profile?.points || 0
  const pendingWishes = wishes.filter((w: any) => !w.is_fulfilled)
  const fulfilledWishes = wishes.filter((w: any) => w.is_fulfilled)
  const displayWishes = activeTab === 'pending' 
    ? pendingWishes 
    : activeTab === 'fulfilled' 
      ? fulfilledWishes 
      : wishes

  const handleSubmitWish = async () => {
    if (!user || !newWish.trim()) return

    if (newWish.length > 200) {
      alert('Wish cannot exceed 200 characters')
      return
    }

    if (points < WISH_COST) {
      alert('Not enough merit coins to make a wish')
      return
    }

    setSubmitting(true)

    try {
      // Deduct points
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: points - WISH_COST })
        .eq('id', user.id)

      if (updateError) {
        alert('Failed to deduct coins: ' + updateError.message)
        setSubmitting(false)
        return
      }

      // Insert wish
      const { error: insertError } = await supabase
        .from('wishes')
        .insert({
          user_id: user.id,
          content: newWish.trim(),
          points_spent: WISH_COST,
          is_public: false,
          is_fulfilled: false,
        })

      if (insertError) {
        console.error('Wish insert error:', insertError)
        // Still show success if points were deducted
      }

      // Record transaction
      try {
        await supabase
          .from('point_transactions')
          .insert({
            user_id: user.id,
            description: 'Wish wall - new wish',
            points: -WISH_COST
          })
      } catch (txErr) {
        console.warn('Transaction record failed (non-critical):', txErr)
      }

      // Show success popup
      setShowSuccess(true)
      setNewWish('')

      // Refresh data
      try {
        const updatedProfile = await getUserProfile(user.id)
        if (updatedProfile) {
          setProfile(updatedProfile)
        } else {
          setProfile((prev: any) => ({ ...prev, points: points - WISH_COST }))
        }
      } catch (e) {
        setProfile((prev: any) => ({ ...prev, points: points - WISH_COST }))
      }

      await fetchWishes(user.id)

      // Auto hide success after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)

    } catch (error: any) {
      console.error('Error submitting wish:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFulfillWish = async (wishId: string) => {
    if (!user) return
    if (!confirm('Mark this wish as fulfilled?')) return

    try {
      const { error } = await supabase
        .from('wishes')
        .update({ 
          is_fulfilled: true,
          fulfilled_at: new Date().toISOString()
        })
        .eq('id', wishId)
        .eq('user_id', user.id)

      if (error) {
        alert('Failed to update wish: ' + error.message)
        return
      }

      setWishes(wishes.map((w: any) => 
        w.id === wishId 
          ? { ...w, is_fulfilled: true, fulfilled_at: new Date().toISOString() }
          : w
      ))
    } catch (error) {
      console.error('Error fulfilling wish:', error)
      alert('Failed to update wish')
    }
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

  if (pageError) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😔</span>
            </div>
            <h2 className="text-xl font-semibold text-stone-700 mb-2">Something went wrong</h2>
            <p className="text-stone-500 mb-4">{pageError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">

          {/* Success Popup */}
          {showSuccess && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full animate-bounce-in">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-3">Wish Sealed ✨</h3>
                <p className="text-stone-600 leading-relaxed">
                  Your wish has been successfully recorded on the wish wall. Keep a positive mind, and your good luck will come soon.
                </p>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">My Wish Wall</h1>
            <p className="text-stone-500 max-w-lg mx-auto">
              Write down your heartfelt wishes, call in positive spiritual energy, and manifest wealth, health and good fortune.
            </p>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-4"></div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-md">
                  <Coins className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-amber-700 font-medium mb-1">My Merit Coins</p>
              <p className="text-2xl font-bold text-amber-800">{points.toLocaleString()}</p>
              <p className="text-xs text-amber-600/70 mt-1">Use coins to post new wishes</p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-5 border border-pink-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-xl flex items-center justify-center shadow-md">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-pink-700 font-medium mb-1">Pending Wishes</p>
              <p className="text-2xl font-bold text-pink-800">{pendingWishes.length}</p>
              <p className="text-xs text-pink-600/70 mt-1">Wishes waiting for blessings</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center shadow-md">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-emerald-700 font-medium mb-1">Wishes Fulfilled</p>
              <p className="text-2xl font-bold text-emerald-800">{fulfilledWishes.length}</p>
              <p className="text-xs text-emerald-600/70 mt-1">Dreams that have come true</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-2 mb-6 bg-white/50 backdrop-blur-sm rounded-2xl p-1.5 border border-stone-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-1.5" />
              All Wishes
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1.5" />
              Pending Blessings
            </button>
            <button
              onClick={() => setActiveTab('fulfilled')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'fulfilled'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
              }`}
            >
              <PartyPopper className="w-4 h-4 inline mr-1.5" />
              Wishes That Came True
            </button>
          </div>

          {/* Wish Cards */}
          <div className="space-y-4 mb-10">
            {displayWishes.length > 0 ? (
              displayWishes.map((wish: any, index: number) => (
                <div
                  key={wish.id}
                  className={`relative rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${
                    wish.is_fulfilled
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300'
                      : 'bg-gradient-to-br from-amber-50/50 to-yellow-50/50 border-amber-200'
                  }`}
                >
                  {/* Star decoration for pending */}
                  {!wish.is_fulfilled && (
                    <div className="absolute top-4 right-4 opacity-30">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </div>
                  )}

                  {/* Fulfilled stamp */}
                  {wish.is_fulfilled && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Wish Granted
                      </div>
                    </div>
                  )}

                  {/* Wish content */}
                  <p className="text-stone-700 text-lg leading-relaxed pr-24">
                    {wish.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-stone-200/50">
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(wish.created_at)}</span>
                      {wish.is_fulfilled && wish.fulfilled_at && (
                        <>
                          <span className="text-stone-300">•</span>
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <PartyPopper className="w-3.5 h-3.5" />
                            Fulfilled: {formatDate(wish.fulfilled_at)}
                          </span>
                        </>
                      )}
                    </div>

                    {!wish.is_fulfilled && (
                      <button
                        onClick={() => handleFulfillWish(wish.id)}
                        className="text-xs px-3 py-1.5 bg-white border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark Fulfilled
                      </button>
                    )}
                  </div>

                  {/* Bottom small text */}
                  {!wish.is_fulfilled && (
                    <p className="text-xs text-amber-500/70 italic mt-3 text-center">
                      *Waiting for good fortune to arrive*
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white/50 rounded-2xl border border-stone-200 border-dashed">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-pink-400" />
                </div>
                <p className="text-stone-500 mb-1">
                  {activeTab === 'pending' 
                    ? 'No pending wishes' 
                    : activeTab === 'fulfilled' 
                      ? 'No fulfilled wishes yet'
                      : 'No wishes yet'}
                </p>
                <p className="text-stone-400 text-sm">Make your first wish below! 🌟</p>
              </div>
            )}
          </div>

          {/* New Wish Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-pink-100">
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-stone-800 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Make a New Wish
              </h2>
              <p className="text-stone-500 text-sm mt-1">
                Lock in your goal and attract good fortune. Each wish costs 10 Merit Coins.
              </p>
            </div>

            <div className="mb-4">
              <textarea
                value={newWish}
                onChange={(e) => setNewWish(e.target.value.slice(0, 200))}
                rows={4}
                placeholder="Write your wish for wealth, career promotion, family wellness or happy relationships… (max 200 characters)"
                className="w-full px-5 py-4 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 resize-none bg-pink-50/30 placeholder-pink-300"
                disabled={submitting || points < WISH_COST}
              />
              <div className="flex justify-between text-xs mt-2">
                <span className="text-stone-400">Cost: 10 Merit Coins per wish</span>
                <span className={`font-medium ${newWish.length >= 180 ? 'text-amber-600' : 'text-stone-400'}`}>
                  {newWish.length}/200
                </span>
              </div>
            </div>

            {points < WISH_COST ? (
              <div className="text-center">
                <p className="text-red-500 text-sm mb-3">
                  Not enough coins. Need {WISH_COST - points} more to make a wish.
                </p>
                <Link
                  href="/user/points"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <TrendingUp className="w-4 h-4" />
                  Earn More Coins
                </Link>
              </div>
            ) : (
              <button
                onClick={handleSubmitWish}
                disabled={submitting || !newWish.trim()}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Casting Your Wish...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Star className="w-5 h-5 fill-white" />
                    Cast My Wish (10 Coins)
                  </span>
                )}
              </button>
            )}

            {/* Tip */}
            <div className="mt-5 flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-pink-50 rounded-xl">
              <div className="w-8 h-8 bg-amber-200/60 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-amber-700" />
              </div>
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> The more sincere your wish, the faster positive energy will come to you. Come back daily to check your wish progress.
              </p>
            </div>
          </div>

        </div>
      </div>
    </SidebarLayout>
  )
}
