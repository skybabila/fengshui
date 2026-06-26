'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Flame, Coins, Star, Bell, Heart, Gem, Sparkles } from 'lucide-react'

const prayerTypes = [
  { id: 'incense', name: 'Burning Incense', emoji: '🪔', cost: 10, description: 'Traditional incense offering for blessings' },
  { id: 'worship', name: 'Devotion Prayer', emoji: '🙏', cost: 20, description: 'Deep spiritual connection prayer' },
  { id: 'light', name: 'Light Offering', emoji: '🕯️', cost: 15, description: 'Light offering for enlightenment' },
  { id: 'wish', name: 'Wish Prayer', emoji: '⭐', cost: 30, description: 'Special prayer for making wishes' },
]

export default function PrayerPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null)
  const [isPraying, setIsPraying] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [prayerResult, setPrayerResult] = useState<string>('')
  const [recentPrayers, setRecentPrayers] = useState<any[]>([])

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
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const points = profile?.points || 0

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
    } catch (error) {
      console.error('Error performing prayer:', error)
    } finally {
      setIsPraying(false)
    }
  }

  return (
    <SidebarLayout>
      <div className="p-8">
        <div className="max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg mb-4">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Temple Prayer</h1>
            <p className="text-stone-500">Offer prayers and earn spiritual blessings</p>
          </div>

        {showResult ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-scale-in">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <Sparkles className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Prayer Complete</h2>
            <p className="text-stone-600 text-lg mb-6">{prayerResult}</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full font-medium">
              <Coins className="w-5 h-5" />
              Balance: {profile?.points || 0} points
            </div>
            <button
              onClick={() => {
                setShowResult(false)
                setSelectedPrayer(null)
              }}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Offer Another Prayer
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <Coins className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm">Your Merit Points</p>
                    <p className="text-2xl font-bold text-amber-600">{points.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-stone-500 text-sm">Points needed for prayers</p>
                  <p className="text-sm text-stone-600">Choose a prayer type below</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {prayerTypes.map((prayer) => (
                <button
                  key={prayer.id}
                  onClick={() => setSelectedPrayer(prayer.id)}
                  className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                    selectedPrayer === prayer.id
                      ? 'border-amber-400 bg-amber-50 shadow-lg'
                      : 'border-stone-200 bg-white hover:border-amber-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                      selectedPrayer === prayer.id ? 'bg-amber-200' : 'bg-stone-100'
                    }`}>
                      {prayer.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-stone-800 mb-1">{prayer.name}</h3>
                      <p className="text-sm text-stone-500 mb-2">{prayer.description}</p>
                      <div className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <Coins className="w-4 h-4" />
                        {prayer.cost} points
                      </div>
                    </div>
                  </div>
                  {selectedPrayer === prayer.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={performPrayer}
              disabled={!selectedPrayer || isPraying || (points < (prayerTypes.find(p => p.id === selectedPrayer)?.cost || 0))}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPraying ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Offering Prayer...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Flame className="w-5 h-5" />
                  Perform Prayer
                </span>
              )}
            </button>

            {recentPrayers.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  Recent Prayers
                </h2>
                <div className="space-y-3">
                  {recentPrayers.map((prayer: any) => (
                    <div key={prayer.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-xl">
                          {prayer.prayer_type === 'Burning Incense' && '🪔'}
                          {prayer.prayer_type === 'Devotion Prayer' && '🙏'}
                          {prayer.prayer_type === 'Light Offering' && '🕯️'}
                          {prayer.prayer_type === 'Wish Prayer' && '⭐'}
                        </div>
                        <div>
                          <p className="font-medium text-stone-800">{prayer.prayer_type}</p>
                          <p className="text-sm text-stone-500">{formatDate(prayer.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-600">-{prayer.points_spent} pts</p>
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
