'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { Sparkles, Calendar, Star, Coins, ArrowRight } from 'lucide-react'

export default function FortunePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-2xl">🌟</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
        </div>
      </div>
    )
  }

  const points = profile?.points || 0

  const fortuneTypes = [
    {
      id: 'daily',
      name: 'Daily Fortune',
      emoji: '☀️',
      cost: 5,
      description: 'Get your daily fortune and make the most of each day',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      href: '/fortune/daily'
    },
    {
      id: 'weekly',
      name: 'Weekly Fortune',
      emoji: '🌙',
      cost: 20,
      description: 'Weekly overview to plan the next seven days ahead',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      href: '/fortune/weekly'
    },
    {
      id: 'monthly',
      name: 'Monthly Fortune',
      emoji: '🌟',
      cost: 50,
      description: 'Detailed monthly forecast for the entire month ahead',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-50',
      href: '/fortune/monthly'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Fortune Center</h1>
          <p className="text-stone-500">Explore your destiny and find your path in life</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">My Coins</p>
              <p className="text-xl font-bold text-amber-600">{points}</p>
            </div>
          </div>
          <Link
            href="/user/points"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View History →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {fortuneTypes.map((fortune) => (
            <Link
              key={fortune.id}
              href={fortune.href}
              className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 ${
                points < fortune.cost ? 'opacity-60' : ''
              }`}
            >
              <div className={`w-14 h-14 ${fortune.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <span className="text-2xl">{fortune.emoji}</span>
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-2">{fortune.name}</h3>
              <p className="text-sm text-stone-500 mb-4">{fortune.description}</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                  <Coins className="w-4 h-4" />
                  {fortune.cost} coins
                </span>
                <ArrowRight className="w-5 h-5 text-stone-400" />
              </div>
              {points < fortune.cost && (
                <p className="mt-3 text-xs text-red-500">Not enough coins</p>
              )}
            </Link>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Fortune Guide
          </h2>
          <div className="space-y-3 text-sm text-stone-600">
            <p>• <strong>Daily Fortune</strong>: Costs 5 coins, available once per day. Includes overall fortune, lucky direction, and things to watch for.</p>
            <p>• <strong>Weekly Fortune</strong>: Costs 20 coins, available once per week. Provides weekly trend analysis and key date reminders.</p>
            <p>• <strong>Monthly Fortune</strong>: Costs 50 coins, available once per month. Detailed monthly fortune outlook and critical timing guidance.</p>
            <p className="text-amber-600">💡 Each fortune type is limited by period. Make every reading count!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
