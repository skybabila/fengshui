'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import {
  History, X, Coins, Sparkles, CheckCircle2, Calendar,
  Flame, Leaf, Heart, Star, ChevronRight, Clock,
  Home, BookOpen, Award, Zap, TrendingUp, RefreshCw
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
    wishes: [
      'May my work go smoothly and my income grow steadily month by month.',
      'May I meet helpful people in my career and seize good opportunities.',
      'May my side projects bring in extra income and financial stability.',
      'May my investments be wise and my savings increase steadily.',
      'May my business run smoothly with more customers and steady revenue.',
      'May I get a promotion and salary increase this year through my hard work.',
      'May my financial situation improve and I feel more at peace about money.',
      'May unexpected income come my way and bring pleasant surprises.',
    ],
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
    wishes: [
      'May my body stay healthy and full of energy every day.',
      'May I sleep well at night and wake up feeling refreshed.',
      'May my digestion be good and my appetite stay healthy.',
      'May any minor discomfort fade away and my body recover naturally.',
      'May I build a regular exercise habit and keep my body strong.',
      'May my mind stay calm and free from excessive stress and anxiety.',
      'May my eyes stay healthy even with long hours of screen work.',
      'May my immune system stay strong and keep illnesses away.',
    ],
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
    wishes: [
      'May my family members all stay healthy and safe.',
      'May my parents be in good health and enjoy their daily life.',
      'May my children grow up happily and stay out of trouble.',
      'May my partner and I get along well with fewer arguments.',
      'May my home be a warm and peaceful place to rest after work.',
      'May family relationships be harmonious and full of understanding.',
      'May trivial family troubles disappear and life be smooth.',
      'May my siblings and relatives get along well and support each other.',
    ],
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
    wishes: [
      'May my work projects go smoothly and be completed on time.',
      'May I make the right decisions at work and avoid mistakes.',
      'May my abilities be recognized by my team and leaders.',
      'May I get a promotion opportunity this year.',
      'May my studies progress well and I pass all exams smoothly.',
      'May I learn new skills quickly and improve my professional value.',
      'May my relationships with colleagues be harmonious and cooperative.',
      'May I find my true career direction and feel fulfilled at work.',
    ],
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
    wishes: [
      'May everything in my life go smoothly and gently.',
      'May I meet kind people wherever I go.',
      'May all my small worries fade away day by day.',
      'May my love life be sweet and fulfilling.',
      'May I find inner peace and feel content every day.',
      'May good things come to me naturally at the right time.',
      'May my overall luck improve and life gets better steadily.',
      'May I stay positive and attract good energy around me.',
    ],
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
  const [currentWishIndex, setCurrentWishIndex] = useState(0)
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
    // No limit on worship次数 - always return false
    return false
  }

  const handleOpenWishModal = (deity: any) => {
    setSelectedDeity(deity)
    const randomIndex = Math.floor(Math.random() * deity.wishes.length)
    setCurrentWishIndex(randomIndex)
    setShowWishModal(true)
  }

  const handleCloseWishModal = () => {
    setShowWishModal(false)
    setSelectedDeity(null)
    setCurrentWishIndex(0)
  }

  const handleWorship = async () => {
    if (!user || !selectedDeity || submitting) return

    const cost = selectedDeity.cost || 0
    if (points < cost) {
      alert('Not enough coins! Please earn more coins first.')
      return
    }

    const currentWish = selectedDeity.wishes[currentWishIndex] || selectedDeity.wishes[0]

    setSubmitting(true)
    setIncenseFading(true)

    try {
      // Deduct coins
      const newPoints = points - cost
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: newPoints })
        .eq('id', user.id)

      if (updateError) {
        alert('Failed to deduct coins: ' + updateError.message)
        setSubmitting(false)
        setIncenseFading(false)
        return
      }

      // Record transaction
      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          description: `Temple Worship - ${selectedDeity.name}`,
          points: -cost
        })

      let insertError: any = null
      
      try {
        const { error } = await supabase
          .from('prayers')
          .insert({
            user_id: user.id,
            deity_id: selectedDeity.id,
            deity_name: selectedDeity.name,
            wish_text: currentWish,
            points_spent: cost,
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
              points_spent: 0,
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

      // No points deduction - worship is free

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
  const hasEnoughCoins = points >= (selectedDeity?.cost || 0)
  const currentWishText = selectedDeity?.wishes?.[currentWishIndex] || ''

  const handleNextWish = () => {
    if (!selectedDeity?.wishes) return
    const nextIndex = Math.floor(Math.random() * selectedDeity.wishes.length)
    setCurrentWishIndex(nextIndex)
  }

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
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-stone-600">Today&apos;s Wish</p>
                    <button
                      onClick={handleNextWish}
                      disabled={submitting}
                      className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Change Wish
                    </button>
                  </div>
                  <div className={`${selectedDeity.bgColor} ${selectedDeity.borderColor} border-2 rounded-2xl p-5 min-h-[100px] flex items-center`}>
                    <p className={`${selectedDeity.textColor} leading-relaxed text-sm`}>
                      {currentWishText}
                    </p>
                  </div>
                </div>

                <div className="mb-6 p-3 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Coins className="w-4 h-4 text-amber-500 mr-2" />
                  <span className="text-sm text-amber-600 font-medium">{selectedDeity.cost} Coins</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseWishModal}
                    className="flex-1 py-3 bg-stone-100 text-stone-600 font-semibold rounded-2xl hover:bg-stone-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWorship}
                    disabled={submitting || !hasEnoughCoins}
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
                        <span className="font-bold text-amber-600">{deity.cost} Coins</span>
                      </div>
                      <button
                        onClick={() => handleOpenWishModal(deity)}
                        disabled={false}
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
                        <span className="font-bold text-xl text-amber-600">{deities[4].cost} Coins</span>
                      </div>
                      <button
                        onClick={() => handleOpenWishModal(deities[4])}
                        disabled={false}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 ${
                          false
                            ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                            : `bg-gradient-to-r ${deities[4].gradient} text-white shadow-lg hover:shadow-xl hover:scale-105`
                        }`}
                      >
                        {false ? (
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
    </SidebarLayout>
  )
}
