'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import {
  History, X, Coins, Sparkles, CheckCircle2, Calendar,
  Flame, Leaf, Heart, Star, ChevronRight, Clock,
  Home, BookOpen, Award, Zap, TrendingUp
} from 'lucide-react'

const deities = [
  {
    id: 'wealth',
    name: 'God of Wealth',
    description: 'The traditional deity of stable career and steady family income. Many people pray here for smooth work and sustainable wealth.',
    cost: 15,
    icon: '💰',
    blessing: 'Your hard work will be rewarded. Your career will move forward steadily, and your income will grow smoothly step by step. Keep a calm mind, and good opportunities will come to you soon.',
    gradient: 'from-amber-400 to-yellow-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
  },
  {
    id: 'health',
    name: 'God of Health',
    description: 'Guardian of physical wellness, recovery and peace of body and mind.',
    cost: 15,
    icon: '🌿',
    blessing: 'Your body will regain vitality. Rest well and maintain a regular lifestyle, fatigue will fade away, and you will stay energetic day after day.',
    gradient: 'from-emerald-400 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
  },
  {
    id: 'family',
    name: 'God of Family Peace',
    description: 'Protects your home environment, keeps your whole family safe and harmonious.',
    cost: 15,
    icon: '🏡',
    blessing: 'Your home will stay full of gentle energy. Family members get along well, trivial troubles disappear, and your living space stays peaceful and warm.',
    gradient: 'from-rose-400 to-pink-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
  },
  {
    id: 'wisdom',
    name: 'God of Career & Wisdom',
    description: 'Blesses academic progress, job promotion and smooth decision-making.',
    cost: 15,
    icon: '📚',
    blessing: 'Your thoughts will become clear. Work projects go smoothly, obstacles are lifted, and you will gain recognition and promotion in the near future.',
    gradient: 'from-blue-400 to-indigo-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
  },
  {
    id: 'fortune',
    name: 'Goddess of Good Fortune',
    description: 'Comprehensive blessing for life, relationships and long-term good energy.',
    cost: 30,
    icon: '🌟',
    blessing: 'All small setbacks will pass. Your life energy turns gentle and smooth. Love, work and daily life will gradually become stable and satisfying. Stay positive and everything will fall into place.',
    gradient: 'from-violet-400 to-purple-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    textColor: 'text-violet-700',
    featured: true,
  },
]

export default function TempleWorshipPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [prayers, setPrayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [todayWorshipped, setTodayWorshipped] = useState<string[]>([])
  const [selectedDeity, setSelectedDeity] = useState<any>(null)
  const [showWishModal, setShowWishModal] = useState(false)
  const [showBlessingModal, setShowBlessingModal] = useState(false)
  const [wishText, setWishText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [incenseFading, setIncenseFading] = useState(false)
  const [blessingDeity, setBlessingDeity] = useState<any>(null)
  const [blessingText, setBlessingText] = useState('')

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

        const today = new Date().toISOString().split('T')[0]
        let worshipped: string[] = []
        
        try {
          const { data: todayPrayers } = await supabase
            .from('prayers')
            .select('deity_id, prayer_type')
            .eq('user_id', authUser.id)
            .gte('created_at', today + 'T00:00:00')
            .lte('created_at', today + 'T23:59:59')

          worshipped = (todayPrayers || []).map((p: any) => p.deity_id || p.prayer_type)
        } catch (e) {
          // Fallback: use prayer_type if deity_id not available
          try {
            const { data: todayPrayers } = await supabase
              .from('prayers')
              .select('prayer_type')
              .eq('user_id', authUser.id)
              .gte('created_at', today + 'T00:00:00')
              .lte('created_at', today + 'T23:59:59')

            worshipped = (todayPrayers || []).map((p: any) => p.prayer_type)
          } catch (e2) {
            console.error('Error fetching today prayers:', e2)
          }
        }
        
        setTodayWorshipped(worshipped)

        const { data: userPrayers } = await supabase
          .from('prayers')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(20)

        setPrayers(userPrayers || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const isDeityWorshipped = (deity: any) => {
    return todayWorshipped.includes(deity.id) || todayWorshipped.includes(deity.name)
  }

  const handleOpenWishModal = (deity: any) => {
    if (isDeityWorshipped(deity)) return
    setSelectedDeity(deity)
    setWishText('')
    setShowWishModal(true)
  }

  const handleCloseWishModal = () => {
    setShowWishModal(false)
    setSelectedDeity(null)
    setWishText('')
  }

  const handleWorship = async () => {
    if (!user || !selectedDeity || submitting) return
    if (wishText.trim().length < 15 || wishText.trim().length > 160) return

    const currentPoints = profile?.points || 0
    if (currentPoints < selectedDeity.cost) {
      return
    }

    setSubmitting(true)
    setIncenseFading(true)

    try {
      let insertError: any = null
      
      try {
        const { error } = await supabase
          .from('prayers')
          .insert({
            user_id: user.id,
            deity_id: selectedDeity.id,
            deity_name: selectedDeity.name,
            wish_text: wishText.trim(),
            points_spent: selectedDeity.cost,
            blessing_text: selectedDeity.blessing,
            prayer_type: selectedDeity.name,
          })
        insertError = error
      } catch (e: any) {
        insertError = e
      }

      if (insertError) {
        // Fallback: try with only old schema columns
        try {
          const { error: fallbackError } = await supabase
            .from('prayers')
            .insert({
              user_id: user.id,
              prayer_type: selectedDeity.name,
              points_spent: selectedDeity.cost,
            })
          if (fallbackError) {
            alert('Failed to submit worship: ' + fallbackError.message)
            setSubmitting(false)
            setIncenseFading(false)
            return
          }
        } catch (fallbackE: any) {
          alert('Failed to submit worship: ' + fallbackE.message)
          setSubmitting(false)
          setIncenseFading(false)
          return
        }
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: currentPoints - selectedDeity.cost })
        .eq('id', user.id)

      if (updateError) {
        alert('Failed to deduct coins: ' + updateError.message)
        setSubmitting(false)
        setIncenseFading(false)
        return
      }

      try {
        await supabase.from('point_transactions').insert({
          user_id: user.id,
          description: `Worship ${selectedDeity.name}`,
          points: -selectedDeity.cost,
        })
      } catch (e) {
        console.warn('Transaction record failed:', e)
      }

      const updatedProfile = await getUserProfile(user.id)
      if (updatedProfile) setProfile(updatedProfile)

      const { data: refreshedPrayers } = await supabase
        .from('prayers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setPrayers(refreshedPrayers || [])
      setTodayWorshipped(prev => [...prev, selectedDeity.id, selectedDeity.name])

      setBlessingDeity(selectedDeity)
      setBlessingText(selectedDeity.blessing)
      setShowWishModal(false)
      setIncenseFading(false)
      
      setTimeout(() => {
        setShowBlessingModal(true)
      }, 300)

    } catch (error) {
      console.error('Error submitting worship:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseBlessingModal = () => {
    setShowBlessingModal(false)
    setBlessingDeity(null)
    setBlessingText('')
    setSelectedDeity(null)
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Leaf className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  const points = profile?.points || 0
  const charCount = wishText.trim().length
  const isValid = charCount >= 15 && charCount <= 160
  const hasEnoughCoins = selectedDeity && points >= selectedDeity.cost

  return (
    <SidebarLayout>
      <div className="p-6 md:p-8 pb-32">
        <div className="max-w-4xl mx-auto">

          {showWishModal && selectedDeity && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                <button
                  onClick={handleCloseWishModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {incenseFading && (
                  <div className="absolute inset-0 bg-white/80 rounded-3xl flex items-center justify-center z-10 transition-opacity duration-500">
                    <div className="text-center">
                      <div className="text-6xl mb-4 animate-pulse">🕯️</div>
                      <p className="text-stone-600 font-medium">Lighting incense...</p>
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${selectedDeity.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-3xl`}>
                    {selectedDeity.icon}
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Light Incense & Send Your Wish</h3>
                  <p className={`text-sm ${selectedDeity.textColor} font-medium`}>To {selectedDeity.name}</p>
                </div>

                <div className="mb-6">
                  <textarea
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="Write your wish for career, health or family peace…"
                    className="w-full h-32 p-4 border-2 border-stone-200 rounded-2xl resize-none focus:outline-none focus:border-emerald-400 transition-colors text-stone-700 placeholder-stone-400"
                    maxLength={160}
                  />
                  <div className="flex justify-between mt-2 text-xs">
                    <span className={charCount < 15 ? 'text-orange-500' : 'text-stone-400'}>
                      {charCount < 15 ? `Minimum 15 characters (${charCount}/15)` : 'Good length'}
                    </span>
                    <span className="text-stone-400">{charCount}/160</span>
                  </div>
                </div>

                <div className="mb-6 p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-stone-500">Cost will be deducted automatically:</span>
                  <div className="flex items-center gap-1 font-bold text-amber-600">
                    <Coins className="w-4 h-4" />
                    {selectedDeity.cost} Coins
                  </div>
                </div>

                {!hasEnoughCoins && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-700 text-center">
                      Insufficient Coins,{' '}
                      <Link href="/user/points" className="font-bold underline">
                        Go to Top-up
                      </Link>
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseWishModal}
                    className="flex-1 py-3 bg-stone-100 text-stone-600 font-semibold rounded-2xl hover:bg-stone-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWorship}
                    disabled={!isValid || submitting || !hasEnoughCoins}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Worshipping...
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4" />
                        Confirm Worship
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showBlessingModal && blessingDeity && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                <button
                  onClick={handleCloseBlessingModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${blessingDeity.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-4xl`}>
                    {blessingDeity.icon}
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-1">Blessing from {blessingDeity.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-amber-500">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">May you receive peaceful energy</span>
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                <div className={`${blessingDeity.bgColor} ${blessingDeity.borderColor} border-2 rounded-2xl p-5 mb-6`}>
                  <p className={`${blessingDeity.textColor} leading-relaxed text-sm`}>
                    {blessingText}
                  </p>
                </div>

                <p className="text-xs text-stone-400 text-center mb-6">
                  This blessing message is for entertainment and spiritual comfort only, not a life prediction.
                </p>

                <button
                  onClick={handleCloseBlessingModal}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg flex items-center justify-center text-2xl">
                  🏛️
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-stone-800">Ancient Deity Worship Hall</h1>
                  <p className="text-stone-500 text-sm">
                    Send sincere wishes to traditional cultural deities, receive peaceful energy and well-being blessings.
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="#records"
              className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm"
            >
              <History className="w-4 h-4" />
              View My Worship History
            </Link>
          </div>

          {/* Deity Selection */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {deities.slice(0, 4).map((deity) => {
                const isWorshipped = isDeityWorshipped(deity)
                return (
                  <div
                    key={deity.id}
                    className={`${deity.bgColor} ${deity.borderColor} border-2 rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-1 ${
                      isWorshipped ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${deity.gradient} rounded-xl flex items-center justify-center text-3xl shadow-md flex-shrink-0`}>
                        {deity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-lg ${deity.textColor} mb-1`}>{deity.name}</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">{deity.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-amber-600">{deity.cost}</span>
                        <span className="text-stone-500 text-sm">Coins</span>
                      </div>
                      <button
                        onClick={() => handleOpenWishModal(deity)}
                        disabled={isWorshipped}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                          isWorshipped
                            ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                            : `bg-gradient-to-r ${deity.gradient} text-white shadow-md hover:shadow-lg hover:scale-105`
                        }`}
                      >
                        {isWorshipped ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Worship Completed Today
                          </>
                        ) : (
                          <>
                            <Flame className="w-4 h-4" />
                            Light Incense & Offer Wishes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {deities[4] && (
              <div className="md:col-span-2 mx-auto max-w-lg">
                <div
                  className={`${deities[4].bgColor} ${deities[4].borderColor} border-2 rounded-3xl p-6 transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden ${
                    isDeityWorshipped(deities[4]) ? 'opacity-75' : ''
                  }`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span className="text-xs font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
                        Premium Blessing
                      </span>
                    </div>

                    <div className="flex items-start gap-5 mb-5">
                      <div className={`w-20 h-20 bg-gradient-to-br ${deities[4].gradient} rounded-2xl flex items-center justify-center text-5xl shadow-lg flex-shrink-0`}>
                        {deities[4].icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-xl ${deities[4].textColor} mb-2`}>{deities[4].name}</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">{deities[4].description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-5 h-5 text-amber-500" />
                        <span className="font-bold text-xl text-amber-600">{deities[4].cost}</span>
                        <span className="text-stone-500">Coins</span>
                      </div>
                      <button
                        onClick={() => handleOpenWishModal(deities[4])}
                        disabled={isDeityWorshipped(deities[4])}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 ${
                          isDeityWorshipped(deities[4])
                            ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                            : `bg-gradient-to-r ${deities[4].gradient} text-white shadow-lg hover:shadow-xl hover:scale-105`
                        }`}
                      >
                        {isDeityWorshipped(deities[4]) ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            Worship Completed Today
                          </>
                        ) : (
                          <>
                            <Flame className="w-5 h-5" />
                            Light Incense & Offer Wishes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Daily Limit Notice */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-stone-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-stone-500" />
              </div>
              <div>
                <p className="text-stone-600 text-sm">
                  You may worship each deity once per day. Every worship is a traditional cultural ritual for entertainment and spiritual comfort only.
                </p>
              </div>
            </div>
          </div>

          {/* My Worship Records */}
          <div id="records" className="bg-white rounded-3xl shadow-lg p-6 border border-stone-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-800">My Worship Records</h2>
                <p className="text-sm text-stone-500">A record of your sincere wishes and blessings</p>
              </div>
            </div>

            {prayers.length > 0 ? (
              <div className="space-y-3">
                {prayers.map((prayer: any) => (
                  <div
                    key={prayer.id}
                    className="p-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-2xl border border-emerald-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {deities.find(d => d.id === prayer.deity_id)?.icon || '✨'}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-stone-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(prayer.created_at)}</span>
                          <span className="text-stone-300">—</span>
                          <span className="font-medium text-stone-600">Worship {prayer.deity_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                        <Coins className="w-3.5 h-3.5" />
                        -{prayer.points_spent}
                      </div>
                    </div>
                    {prayer.wish_text && (
                      <p className="text-stone-700 text-sm leading-relaxed mb-2">
                        &ldquo;{prayer.wish_text}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium cursor-pointer hover:text-emerald-700 transition-colors">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>View Blessing Message</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-7 h-7 text-stone-300" />
                </div>
                <p className="text-stone-500 mb-1">No worship records yet</p>
                <p className="text-stone-400 text-sm">Begin your journey by offering your first sincere wish</p>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-stone-400">
              All worship content belongs to traditional folk cultural experience, for entertainment only. It does not constitute fate prediction.
            </p>
          </div>
        </div>
      </div>

      {/* Coin Quick Bar */}
      <div className="fixed bottom-0 left-0 right-0 ml-64 bg-white/95 backdrop-blur-lg border-t border-stone-200 px-6 py-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-stone-400">Current Balance</p>
              <p className="text-xl font-bold text-stone-800">{points.toLocaleString()} <span className="text-sm font-normal text-stone-500">Coins</span></p>
            </div>
          </div>

          <Link
            href="/user/points"
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Earn More Coins
          </Link>
        </div>
      </div>
    </SidebarLayout>
  )
}
