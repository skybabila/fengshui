'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Flame, Coins, Star, Bell, Heart, Gem, Sparkles, Info, Clock, CheckCircle2 } from 'lucide-react'

const prayerTypes = [
  { 
    id: 'incense', 
    name: 'Burning Incense', 
    emoji: '🪔', 
    cost: 10, 
    description: 'Traditional incense offering for peace and blessings',
    longDesc: 'Light a stick of incense and let the smoke carry your prayers to the heavens. A timeless tradition for seeking peace, health, and good fortune.',
    benefits: ['Peace of mind', 'Family health', 'Good luck']
  },
  { 
    id: 'worship', 
    name: 'Devotion Prayer', 
    emoji: '🙏', 
    cost: 20, 
    description: 'Deep spiritual connection and devotion',
    longDesc: 'Offer your most sincere prayers with full devotion. This prayer is for those seeking deeper spiritual connection and guidance in life.',
    benefits: ['Spiritual growth', 'Inner peace', 'Divine guidance']
  },
  { 
    id: 'light', 
    name: 'Light Offering', 
    emoji: '🕯️', 
    cost: 15, 
    description: 'Light offering for wisdom and enlightenment',
    longDesc: 'Offer a light to illuminate the path ahead. Symbolizes wisdom, clarity, and the dispelling of darkness from your life.',
    benefits: ['Wisdom', 'Clarity', 'Bright future']
  },
  { 
    id: 'wish', 
    name: 'Wish Prayer', 
    emoji: '⭐', 
    cost: 30, 
    description: 'Special prayer for making your wishes come true',
    longDesc: 'A powerful prayer dedicated to making your deepest wishes come true. Combined with sincere heart, your wishes may be answered.',
    benefits: ['Wish fulfillment', 'Dreams come true', 'Good fortune']
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

        const { data: prayers } = await supabase
          .from('prayers')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        setRecentPrayers(prayers || [])
        setTotalPrayers(prayers?.length || 0)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const points = profile?.points || 0
  const selectedPrayerData = prayerTypes.find(p => p.id === selectedPrayer)

  const prayerMessages = [
    'Your prayers have been heard. May blessings come your way.',
    'The divine has received your offering. Peace be with you.',
    'Your devotion brings positive energy. Good fortune awaits.',
    'May your prayers be answered according to the divine will.',
    'The smoke carries your wishes to the heavens.',
    'Blessings flow upon you like gentle rain.',
    'Your heart-felt prayer has been received with gratitude.',
    'Positive vibrations surround you. Stay open to receive.',
  ]

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
      await supabase
        .from('user_profiles')
        .update({ points: points - prayer.cost })
        .eq('id', user.id)

      const { data: newPrayer } = await supabase
        .from('prayers')
        .insert({
          user_id: user.id,
          prayer_type: prayer.name,
          points_spent: prayer.cost,
        })
        .select()
        .single()

      const randomMessage = prayerMessages[Math.floor(Math.random() * prayerMessages.length)]
      setPrayerResult(randomMessage)
      setShowResult(true)

      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)

      const { data: prayers } = await supabase
        .from('prayers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      setRecentPrayers(prayers || [])
      setTotalPrayers(prev => prev + 1)
    } catch (error) {
      console.error('Error performing prayer:', error)
    } finally {
      setIsPraying(false)
    }
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
            <p className="text-stone-500">Offer prayers with sincerity and receive divine blessings</p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm text-stone-500">My Coins</p>
              <p className="text-xl font-bold text-amber-600">{points.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-sm text-stone-500">Total Prayers</p>
              <p className="text-xl font-bold text-stone-800">{totalPrayers}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <p className="text-sm text-stone-500">Blessings</p>
              <p className="text-xl font-bold text-pink-600">∞</p>
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
              <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Choose Your Prayer
              </h2>
              <p className="text-stone-500 text-sm mb-4">Select a prayer type that resonates with your heart today</p>
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
                        <p className="text-sm text-stone-500 mb-2">{prayer.description}</p>
                        <div className="inline-flex items-center gap-1 text-amber-600 font-bold">
                          <Coins className="w-4 h-4" />
                          {prayer.cost} coins
                        </div>
                      </div>
                    </div>
                    {selectedPrayer === prayer.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-md">
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
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 mb-6 border border-orange-200">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{selectedPrayerData.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-stone-800 mb-2">{selectedPrayerData.name}</h3>
                    <p className="text-stone-600 mb-4">{selectedPrayerData.longDesc}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedPrayerData.benefits.map((benefit, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm text-orange-700 border border-orange-200">
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
                  {selectedPrayer ? `Offer ${selectedPrayerData?.name}` : 'Select a prayer to begin'}
                </span>
              )}
            </button>

            {selectedPrayer && points < (selectedPrayerData?.cost || 0) && (
              <p className="text-center text-red-500 text-sm mt-3">
                Not enough coins. Need {(selectedPrayerData?.cost || 0) - points} more coins.
              </p>
            )}

            {/* Recent Prayers */}
            {recentPrayers.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-stone-100">
                <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Recent Prayers
                </h2>
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
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </SidebarLayout>
  )
}
