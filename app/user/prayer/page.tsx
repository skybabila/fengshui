'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Flame, Coins, Star, Heart, Sparkles, Clock, CheckCircle2, TrendingUp, Scroll, Cloud, Sunrise, Mountain, Sun } from 'lucide-react'

// Chinese Deities for Worship System - 6 most popular for overseas audience
const deities = [
  { 
    id: 'caishen', 
    name: 'God of Wealth', 
    deity: 'Caishen',
    emoji: '🧧', 
    cost: 30, 
    blessing: 'Wealth, business income, salary growth and financial luck',
    description: 'The most revered god of prosperity. Worship him to attract steady income, new business opportunities and stable financial growth.',
    prayerEffect: 'Attract new business opportunities and stable long-term prosperity.',
    domains: ['Business profit', 'Salary raise', 'Investment luck', 'Personal wealth'],
    prayerText: 'I sincerely offer this worship to God of Wealth. May I receive continuous income, new business deals and stable financial luck. May all my money-related wishes come true.',
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    colorName: 'text-yellow-700',
  },
  { 
    id: 'guanyu', 
    name: 'Guan Yu', 
    subtitle: 'Career God',
    deity: 'Guan Yu',
    emoji: '⚔️', 
    cost: 25, 
    blessing: 'Job promotion, workplace protection and career breakthrough',
    description: 'Patron saint of professionals and entrepreneurs. He protects you from office conflict and brings advancement at work.',
    prayerEffect: 'Avoid office disputes and gain steady advancement at work.',
    domains: ['Job promotion', 'Workplace stability', 'Leadership', 'Career breakthrough'],
    prayerText: 'I sincerely offer this worship to Guan Yu. May my career flourish with steady promotion, may noble people guide my path, and may I succeed in all my professional endeavors.',
    color: 'from-red-500 to-orange-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    iconBg: 'bg-gradient-to-br from-red-500 to-orange-500',
    colorName: 'text-red-700',
  },
  { 
    id: 'household', 
    name: 'Household Guardian', 
    deity: 'Jade Emperor Household Guardian',
    emoji: '🏠', 
    cost: 10, 
    blessing: 'Family peace, home safety and protection from bad energy',
    description: 'House guardian deity who dispels negative Qi. Keep illness and misfortune away from your family.',
    prayerEffect: 'Keep your whole family away from sickness and misfortune.',
    domains: ['Family health', 'Home safety', 'Ward off bad energy', 'Household peace'],
    prayerText: 'I sincerely offer this worship to the Household Guardian. May my family be protected from all harm and illness, may our home be filled with peace and positive energy, and may misfortune never enter our door.',
    color: 'from-amber-400 to-yellow-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
    colorName: 'text-amber-700',
  },
  { 
    id: 'longevity', 
    name: 'God of Longevity', 
    deity: 'Shouxing',
    emoji: '🍑', 
    cost: 15, 
    blessing: 'Physical health, vitality and wellness for family elders',
    description: 'Bless your body with vitality, ease anxiety and bring good health to you and your parents.',
    prayerEffect: 'Relieve stress and bring long-term physical and mental peace.',
    domains: ['Physical wellness', 'Recovery from sickness', 'Peace of mind', 'Long life for elders'],
    prayerText: 'I sincerely offer this worship to the God of Longevity. May my body be strong and free from illness, may my mind be calm and peaceful, and may my parents and elders enjoy long, healthy lives.',
    color: 'from-emerald-400 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    colorName: 'text-emerald-700',
  },
  { 
    id: 'yuelao', 
    name: 'Yue Lao', 
    subtitle: 'Matchmaker God',
    deity: 'Yue Lao',
    emoji: '🌹', 
    cost: 20, 
    blessing: 'Meet your soulmate, build stable and happy relationships',
    description: 'The ancient matchmaker who ties red fate threads. Pray for your destined partner and harmonious love life.',
    prayerEffect: 'Tie red fate threads and bring you harmonious marriage luck.',
    domains: ['Find a partner', 'Stable relationship', 'Happy marriage', 'Romantic luck'],
    prayerText: 'I sincerely offer this worship to Yue Lao. May my destined partner find their way to me, may our relationship be filled with love and harmony, and may we build a happy life together.',
    color: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    iconBg: 'bg-gradient-to-br from-pink-400 to-rose-500',
    colorName: 'text-pink-700',
  },
  { 
    id: 'wenchang', 
    name: 'Wen Chang', 
    subtitle: 'God of Wisdom',
    deity: 'Wen Chang',
    emoji: '📖', 
    cost: 15, 
    blessing: 'Exam success, clear thinking and wise decisions',
    description: 'Patron of scholars and thinkers. Gain sharp judgment, pass interviews and make wise life choices.',
    prayerEffect: 'Sharpen your mind and succeed in interviews and important choices.',
    domains: ['Exam success', 'Study efficiency', 'Clear mind', 'Decision wisdom'],
    prayerText: 'I sincerely offer this worship to Wen Chang. May my mind be clear and sharp, may I succeed in all my exams and interviews, and may wisdom guide every important decision in my life.',
    color: 'from-blue-400 to-indigo-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    colorName: 'text-blue-700',
  },
]

// Scroll decoration component
function ScrollDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating clouds/smoke */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-amber-100/30 to-orange-100/30 rounded-full blur-2xl animate-float"></div>
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-orange-100/20 to-amber-100/20 rounded-full blur-3xl animate-float-delayed"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-yellow-100/20 to-orange-100/20 rounded-full blur-2xl animate-float-slow"></div>
      
      {/* Temple pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c2410c' fill-opacity='1'%3E%3Cpath d='M40 0L0 40L40 80L80 40L40 0zM40 10L10 40L40 70L70 40L40 10z'/%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>
    </div>
  )
}

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
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          window.location.href = '/login'
          return
        }
        setUser(authUser)

        const userProfile = await getUserProfile(authUser.id)
        setProfile(userProfile)

        try {
          const { data: prayers } = await supabase
            .from('prayers')
            .select('*')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(50)
          
          setRecentPrayers(prayers || [])
          setTotalPrayers(prayers?.length || 0)
        } catch (prayerErr) {
          console.error('Prayer fetch exception:', prayerErr)
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
  const selectedDeity = deities.find(d => d.id === selectedPrayer)

  const performPrayer = async () => {
    if (!selectedPrayer || !user) return

    const deity = deities.find(d => d.id === selectedPrayer)
    if (!deity) return

    if (points < deity.cost) {
      alert('Not enough merit points')
      return
    }

    setIsPraying(true)

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: points - deity.cost })
        .eq('id', user.id)
        .select()

      if (updateError) {
        alert('Failed to deduct points: ' + updateError.message)
        return
      }

      try {
        await supabase.from('prayers').insert({
          user_id: user.id,
          prayer_type: deity.name,
          points_spent: deity.cost,
        })
      } catch (e) {
        console.warn('Prayer insert failed (non-critical):', e)
      }

      try {
        await supabase.from('point_transactions').insert({
          user_id: user.id,
          description: `Worship to ${deity.name}`,
          points: -deity.cost
        })
      } catch (e) {
        console.warn('Transaction failed (non-critical):', e)
      }

      setShowResult(true)

      try {
        const updatedProfile = await getUserProfile(user.id)
        if (updatedProfile) setProfile(updatedProfile)
      } catch (e) {
        setProfile((prev: any) => ({ ...prev, points: points - deity.cost }))
      }

      try {
        const { data: prayers } = await supabase
          .from('prayers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
        if (prayers) {
          setRecentPrayers(prayers)
          setTotalPrayers(prayers.length)
        }
      } catch (e) {
        setTotalPrayers(prev => prev + 1)
      }
      
    } catch (error: any) {
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
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Flame className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-stone-700">Entering the Temple...</h2>
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
        <div className="max-w-5xl mx-auto">

          {/* Success Result */}
          {showResult && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full relative overflow-hidden">
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"></div>
                
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-6xl">{selectedDeity?.emoji}</div>
                </div>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                  Worship Successfully Offered
                </div>
                
                <h2 className="text-2xl font-bold text-stone-800 mb-3">
                  {selectedDeity?.name}
                </h2>
                
                <p className="text-stone-600 leading-relaxed mb-6">
                  Your devout worship has been received by {selectedDeity?.deity}. Stay positive, and your wish will soon be blessed.
                </p>
                
                <div className="flex items-center justify-center gap-2 text-amber-600 font-semibold mb-6">
                  <Coins className="w-5 h-5" />
                  <span>Remaining: {profile?.points || 0} coins</span>
                </div>
                
                <button
                  onClick={() => {
                    setShowResult(false)
                    setSelectedPrayer(null)
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Return to Temple
                </button>
              </div>
            </div>
          )}

          {/* Main Temple Card */}
          <div className="relative bg-gradient-to-b from-stone-100 via-amber-50/50 to-orange-50/30 rounded-3xl shadow-2xl border border-amber-200/50 overflow-hidden">
            <ScrollDecoration />
            
            {/* Temple Roof Header */}
            <div className="relative bg-gradient-to-b from-amber-700 via-amber-600 to-orange-700 px-8 py-10 text-center overflow-hidden">
              {/* Roof pattern */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 22px)`,
              }}></div>
              
              {/* Floating flames */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-amber-900/20 to-transparent"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <Flame className="w-8 h-8 text-amber-200 animate-pulse" />
                  <Flame className="w-10 h-10 text-amber-300 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <Flame className="w-8 h-8 text-amber-200 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">
                  Temple of Chinese Deities
                </h1>
                
                <p className="text-amber-100/80 text-sm md:text-base">
                  Offer devout worship to the right god, and receive targeted divine blessings for your wishes.
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 p-6 md:p-8">
              
              {/* Stats Bar - Temple Pillars Style */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Coins, label: 'My Merit Coins', sublabel: 'Balance available for worship rituals', value: points.toLocaleString(), color: 'amber', bg: 'from-amber-100 to-orange-100' },
                  { icon: Flame, label: 'Total Worships', sublabel: 'Times you have prayed in the temple', value: totalPrayers, color: 'orange', bg: 'from-orange-100 to-red-100' },
                  { icon: Star, label: 'Blessings Granted', sublabel: 'Record of fulfilled prayers', value: '∞', color: 'pink', bg: 'from-pink-100 to-rose-100' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-4 text-center border border-${stat.color}-200 shadow-lg`}>
                    <stat.icon className={`w-6 h-6 mx-auto mb-2 text-${stat.color}-500`} />
                    <p className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</p>
                    <p className="text-xs text-stone-600 mt-1 font-medium">{stat.label}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Deity Selection */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sun className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-800">Choose Your Deity for Your Wish</h2>
                    <p className="text-sm text-stone-500">Pick the god who rules over what you want to manifest.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {deities.map((deity) => (
                    <button
                      key={deity.id}
                      onClick={() => setSelectedPrayer(deity.id)}
                      className={`relative p-5 rounded-2xl border-2 transition-all text-left group hover:-translate-y-1 ${
                        selectedPrayer === deity.id
                          ? `${deity.borderColor} ${deity.bgColor} shadow-xl`
                          : 'border-stone-200 bg-white hover:border-amber-200 hover:shadow-lg'
                      }`}
                    >
                      {/* Selected indicator */}
                      {selectedPrayer === deity.id && (
                        <div className={`absolute -top-2 -right-2 w-8 h-8 ${deity.iconBg} rounded-full flex items-center justify-center shadow-lg`}>
                          <Star className="w-4 h-4 text-white fill-white" />
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 ${deity.bgColor} rounded-xl flex items-center justify-center text-3xl transition-transform ${
                          selectedPrayer === deity.id ? 'scale-110 rotate-3' : 'group-hover:scale-105'
                        }`}>
                          {deity.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-stone-800 text-lg">{deity.name}</h3>
                            {deity.subtitle && (
                              <span className={`text-xs ${deity.colorName} font-medium bg-white/60 px-2 py-0.5 rounded-full`}>
                                {deity.subtitle}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${deity.colorName} font-semibold mb-2`}>✨ {deity.blessing}</p>
                          <p className="text-sm text-stone-500 mb-3 line-clamp-2">{deity.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-amber-600 font-bold">
                              <Coins className="w-4 h-4" />
                              <span>{deity.cost} coins</span>
                            </div>
                            {selectedPrayer === deity.id && (
                              <span className="text-xs text-emerald-600 font-medium">Selected</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Blessing domains preview */}
                      {selectedPrayer === deity.id && (
                        <div className="mt-4 pt-4 border-t border-stone-200">
                          <p className="text-xs text-stone-500 mb-2 font-medium">What {deity.deity} protects:</p>
                          <div className="flex flex-wrap gap-2">
                            {deity.domains.map((domain, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-white rounded-full text-stone-600 border border-stone-200">
                                ✨ {domain}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Deity Details & Action */}
              {selectedDeity && (
                <div className={`mb-8 p-6 rounded-2xl bg-gradient-to-br ${selectedDeity.bgColor} border-2 ${selectedDeity.borderColor} relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-5xl">{selectedDeity.emoji}</div>
                      <div>
                        <h3 className="text-xl font-bold text-stone-800">Your Worship Ritual to {selectedDeity.name}</h3>
                        <p className={`text-sm ${selectedDeity.colorName} font-medium`}>Goal: {selectedDeity.blessing}</p>
                      </div>
                    </div>
                    
                    {/* Prayer Text */}
                    <div className="bg-white/60 rounded-xl p-4 mb-4 border border-white/80">
                      <p className="text-xs text-stone-500 mb-2 font-medium flex items-center gap-1">
                        <Scroll className="w-3 h-3" />
                        Your Prayer
                      </p>
                      <p className="text-stone-700 leading-relaxed italic">
                        &ldquo;{selectedDeity.prayerText}&rdquo;
                      </p>
                    </div>

                    {/* Prayer Effect */}
                    <div className="flex items-center gap-2 text-sm text-stone-600 mb-4 bg-white/40 rounded-xl p-3">
                      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <p><strong>Prayer Effect:</strong> {selectedDeity.prayerEffect}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Offer your sincere prayer for best results</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {selectedDeity ? (
                points >= selectedDeity.cost ? (
                  <button
                    onClick={performPrayer}
                    disabled={isPraying}
                    className={`w-full py-4 bg-gradient-to-r ${selectedDeity.color} text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden group`}
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700"></span>
                    {isPraying ? (
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Offering Your Worship...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3 relative z-10">
                        <Flame className="w-6 h-6" />
                        Offer Worship Now
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-200">
                    <p className="text-red-600 font-semibold mb-3">
                      Need {selectedDeity.cost - points} more coins for this worship
                    </p>
                    <Link
                      href="/user/points"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full hover:shadow-lg transition-all"
                    >
                      <TrendingUp className="w-5 h-5" />
                      Earn Free Coins
                    </Link>
                  </div>
                )
              ) : (
                <div className="text-center p-6 bg-stone-100 rounded-2xl">
                  <p className="text-stone-500">Select a deity above to begin your worship</p>
                </div>
              )}
            </div>
          </div>

          {/* Prayer History - Scroll Style */}
          {recentPrayers.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-stone-300 to-stone-400 rounded-xl flex items-center justify-center shadow-lg">
                  <Scroll className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-800">Your Worship History</h2>
                  <p className="text-sm text-stone-500">Every devout prayer is archived in the temple.</p>
                </div>
              </div>

              <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 shadow-lg">
                <div className="space-y-3">
                  {recentPrayers.map((prayer: any, index: number) => {
                    const matchedDeity = deities.find(d => 
                      d.name === prayer.prayer_type || 
                      d.deity === prayer.prayer_type ||
                      prayer.prayer_type?.includes(d.name) ||
                      prayer.prayer_type?.includes(d.deity)
                    )
                    const displayEmoji = matchedDeity?.emoji || '🙏'
                    const displayName = prayer.prayer_type
                    
                    return (
                      <div 
                        key={prayer.id} 
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center text-2xl">
                            {displayEmoji}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-800">{displayName}</p>
                            <p className="text-xs text-stone-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(prayer.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-600">-{prayer.points_spent} coins</p>
                          <p className="text-xs text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Blessing Recorded
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <p className="text-xs text-stone-400 mt-4 text-center italic">
                  * All worships are sealed in the temple archive and granted with divine sincerity. *
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {recentPrayers.length === 0 && !loading && (
            <div className="mt-8 text-center py-12 bg-gradient-to-b from-stone-100 to-stone-50 rounded-2xl border border-stone-200">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-700 mb-2">Your Worship Scroll is Empty</h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto">
                Begin your spiritual journey by offering your first worship above. The temple awaits your sincere devotion.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-float-slow {
          animation: float 10s ease-in-out infinite;
          animation-delay: 4s;
        }
      `}</style>
    </SidebarLayout>
  )
}
