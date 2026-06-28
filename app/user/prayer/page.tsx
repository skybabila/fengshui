'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Flame, Coins, Star, Heart, Sparkles, Info, Clock, CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react'

const prayerTypes = [
  { 
    id: 'incense', 
    name: 'Burning Incense', 
    emoji: '🪔', 
    cost: 10, 
    goal: 'Family Safety & Home Harmony',
    description: 'Ward off negative energy, protect your whole family, and keep your home peaceful and stable.',
    benefits: ['Negative energy removed', 'Family protection', 'Home stability'],
    gradient: 'from-amber-400 to-orange-500'
  },
  { 
    id: 'light', 
    name: 'Light Offering', 
    emoji: '🕯️', 
    cost: 15, 
    goal: 'Career & Future Opportunities',
    description: 'Pray for wisdom and clear judgment, attract new job chances and brighter career prospects.',
    benefits: ['Wisdom & clarity', 'New opportunities', 'Career growth'],
    gradient: 'from-yellow-400 to-amber-500'
  },
  { 
    id: 'worship', 
    name: 'Devotion Prayer', 
    emoji: '🙏', 
    cost: 20, 
    goal: 'Physical Health & Inner Peace',
    description: 'Calm anxiety, improve physical wellness, and gain long-term stability of body and mind.',
    benefits: ['Anxiety relief', 'Physical wellness', 'Mental balance'],
    gradient: 'from-violet-400 to-purple-500'
  },
  { 
    id: 'wish', 
    name: 'Wish Prayer', 
    emoji: '⭐', 
    cost: 30, 
    goal: 'Wealth, Promotion & Life Goals',
    description: 'Powerful blessing for salary raise, business growth and the realization of your biggest life wishes.',
    benefits: ['Salary increase', 'Business growth', 'Wish fulfillment'],
    gradient: 'from-pink-400 to-rose-500'
  },
]

export default function PrayerPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null)
  const [isPraying, setIsPraying] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [prayerResult, setPrayerResult] = useState<string>('')
  const [recentPrayers, setRecentPrayers] = useState<any[]>([])
  const [totalPrayers, setTotalPrayers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setPageError(null)
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('Auth error:', authError)
        }
        
        if (!authUser) {
          window.location.href = '/login'
          return
        }
        setUser(authUser)

        const userProfile = await getUserProfile(authUser.id)
        setProfile(userProfile)

        // Fetch prayers with error handling
        try {
          const { data: prayers, error: prayersError } = await supabase
            .from('prayers')
            .select('*')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(50)
          
          if (prayersError) {
            console.error('Error fetching prayers:', prayersError)
            // Don't fail the whole page, just show empty
          }
          
          setRecentPrayers(prayers || [])
          setTotalPrayers(prayers?.length || 0)
        } catch (prayerErr) {
          console.error('Prayer fetch exception:', prayerErr)
          // Continue anyway
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setPageError('Failed to load page. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const points = profile?.points || 0
  const selectedPrayerData = prayerTypes.find(p => p.id === selectedPrayer)

  const performPrayer = async () => {
    if (!selectedPrayer || !user) return

    const prayer = prayerTypes.find(p => p.id === selectedPrayer)
    if (!prayer) return

    if (points < prayer.cost) {
      alert('Not enough merit points')
      return
    }

    setIsPraying(true)

    try {
      // Deduct points
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: points - prayer.cost })
        .eq('id', user.id)

      if (updateError) {
        console.error('Points update error:', updateError)
        alert('Failed to deduct points: ' + updateError.message)
        setIsPraying(false)
        return
      }

      // Insert prayer record
      const { error: insertError } = await supabase
        .from('prayers')
        .insert({
          user_id: user.id,
          prayer_type: prayer.name,
          points_spent: prayer.cost,
        })

      if (insertError) {
        console.error('Prayer insert error:', insertError)
        alert('Failed to record prayer: ' + insertError.message)
        // Still show success since points were deducted
      }

      // Record transaction
      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          description: `${prayer.name} prayer`,
          points: -prayer.cost
        })

      setPrayerResult('Your prayer has been sent to the temple. Stay positive, good fortune will arrive soon.')
      setShowResult(true)

      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)

      // Refresh prayers list
      try {
        const { data: prayers } = await supabase
          .from('prayers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
        
        setRecentPrayers(prayers || [])
      } catch (e) {
        console.error('Error refreshing prayers:', e)
      }
      
      setTotalPrayers(prev => prev + 1)
    } catch (error) {
      console.error('Error performing prayer:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsPraying(false)
    }
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Flame className="w-8 h-8 text-orange-500" />
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
              className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
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

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg mb-4">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Temple of Blessings</h1>
            <p className="text-stone-500">Offer sincere prayers and receive divine protection & lasting good fortune</p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-stone-500 mb-1">My Merit Coins</p>
              <p className="text-xl font-bold text-amber-600">{points.toLocaleString()}</p>
              <p className="text-xs text-stone-400 mt-1">Available for prayers & fortune readings</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-xs text-stone-500 mb-1">Total Prayers Offered</p>
              <p className="text-xl font-bold text-stone-800">{totalPrayers}</p>
              <p className="text-xs text-stone-400 mt-1">Your spiritual devotion record</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <p className="text-xs text-stone-500 mb-1">Blessings Received</p>
              <p className="text-xl font-bold text-pink-600">∞</p>
              <p className="text-xs text-stone-400 mt-1">Good luck coming your way</p>
            </div>
          </div>

        {showResult ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-stone-100">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-amber-500" />
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
              <CheckCircle2 className="w-4 h-4" />
              Prayer Complete
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-4">
              {selectedPrayerData?.name}
            </h2>
            <div className="text-5xl mb-6">{selectedPrayerData?.emoji}</div>
            <p className="text-stone-600 text-lg mb-6 leading-relaxed">{prayerResult}</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-700 rounded-full font-medium border border-amber-200">
              <Coins className="w-5 h-5" />
              Balance: {profile?.points || 0} coins
            </div>
            <div>
              <button
                onClick={() => {
                  setShowResult(false)
                  setSelectedPrayer(null)
                }}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Offer Another Prayer
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Prayer Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-stone-100">
              <h2 className="text-lg font-bold text-stone-800 mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Choose Your Blessing Today
              </h2>
              <p className="text-stone-500 text-sm mb-6">Pick one prayer that matches what you wish to attract</p>
              <div className="grid md:grid-cols-2 gap-4">
                {prayerTypes.map((prayer) => (
                  <button
                    key={prayer.id}
                    onClick={() => setSelectedPrayer(prayer.id)}
                    className={`relative p-5 rounded-2xl border-2 transition-all text-left ${
                      selectedPrayer === prayer.id
                        ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg'
                        : 'border-stone-200 bg-white hover:border-orange-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all ${
                        selectedPrayer === prayer.id ? 'bg-orange-200 scale-110' : 'bg-stone-100'
                      }`}>
                        {prayer.emoji}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-stone-800 mb-1">{prayer.name}</h3>
                        <p className="text-xs text-amber-600 font-medium mb-2">Goal: {prayer.goal}</p>
                        <p className="text-sm text-stone-500 mb-3">{prayer.description}</p>
                        <div className="inline-flex items-center gap-1 text-amber-600 font-bold">
                          <Coins className="w-4 h-4" />
                          {prayer.cost} coins
                        </div>
                      </div>
                    </div>
                    {selectedPrayer === prayer.id && (
                      <div className="absolute top-4 right-4">
                        <div className={`w-6 h-6 bg-gradient-to-br ${prayer.gradient} rounded-full flex items-center justify-center shadow-md`}>
                          <Star className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Prayer Details */}
            {selectedPrayerData && (
              <div className={`bg-gradient-to-br ${selectedPrayerData.gradient} bg-opacity-10 rounded-2xl p-6 mb-6 border-2 border-current border-opacity-20`}>
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{selectedPrayerData.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-stone-800 mb-2">{selectedPrayerData.name}</h3>
                    <p className="text-stone-600 mb-4">{selectedPrayerData.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedPrayerData.benefits.map((benefit, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm text-stone-700 border border-stone-200">
                          ✨ {benefit}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Info className="w-4 h-4" />
                      <span>Offer with sincere heart for best results</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Perform Button */}
            <button
              onClick={performPrayer}
              disabled={!selectedPrayer || isPraying || (points < (selectedPrayerData?.cost || 0))}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isPraying ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Offering Prayer...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Flame className="w-5 h-5" />
                  {selectedPrayer ? `Offer ${selectedPrayerData?.name}` : 'Start Your Prayer Ritual'}
                </span>
              )}
            </button>

            {selectedPrayer && points < (selectedPrayerData?.cost || 0) && (
              <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-600 text-sm text-center mb-3">
                  Not enough coins. Need {(selectedPrayerData?.cost || 0) - points} more coins.
                </p>
                <Link
                  href="/user/points"
                  className="block w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl text-center hover:shadow-lg transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Earn More Coins
                  </span>
                </Link>
              </div>
            )}

            {/* Prayer History */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-stone-100">
              <h2 className="text-lg font-bold text-stone-800 mb-1 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Your Prayer History
              </h2>
              <p className="text-stone-500 text-sm mb-6">Every sincere wish will be recorded and blessed.</p>
              {recentPrayers.length > 0 ? (
                <div className="space-y-3">
                  {recentPrayers.map((prayer: any) => (
                    <div key={prayer.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center text-xl">
                          {prayer.prayer_type === 'Burning Incense' && '🪔'}
                          {prayer.prayer_type === 'Devotion Prayer' && '🙏'}
                          {prayer.prayer_type === 'Light Offering' && '🕯️'}
                          {prayer.prayer_type === 'Wish Prayer' && '⭐'}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-800">{prayer.prayer_type}</p>
                          <p className="text-sm text-stone-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(prayer.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600">-{prayer.points_spent}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Flame className="w-8 h-8 text-orange-400" />
                  </div>
                  <p className="text-stone-500 mb-2">No prayers yet</p>
                  <p className="text-stone-400 text-sm">Start your spiritual journey with a prayer above!</p>
                </div>
              )}
              {recentPrayers.length > 0 && (
                <p className="text-xs text-stone-400 mt-4 text-center italic">
                  *Your wish has been recorded in the temple archive.*
                </p>
              )}
            </div>

            {/* Pro Tip */}
            <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-800 mb-1">Pro Tip</h3>
                  <p className="text-sm text-amber-700">
                    Complete daily check-ins and fill out your profile to earn free merit coins and keep sending blessings every day.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </SidebarLayout>
  )
}
