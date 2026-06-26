'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase, getUserProfile } from '@/lib/supabase'
import { Sparkles, Calendar, Star, Coins, ArrowRight, Sun, Moon, CalendarDays } from 'lucide-react'

export default function FortunePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

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
      icon: Sun,
      cost: 5,
      description: 'Get your daily fortune and make the most of each day',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      hoverBg: 'hover:bg-amber-50',
      hoverBorder: 'hover:border-amber-300',
      href: '/fortune/daily',
      active: pathname === '/fortune/daily'
    },
    {
      id: 'weekly',
      name: 'Weekly Fortune',
      emoji: '🌙',
      icon: Moon,
      cost: 20,
      description: 'Weekly overview to plan the next seven days ahead',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      hoverBg: 'hover:bg-purple-50',
      hoverBorder: 'hover:border-purple-300',
      href: '/fortune/weekly',
      active: pathname === '/fortune/weekly'
    },
    {
      id: 'monthly',
      name: 'Monthly Fortune',
      emoji: '🌟',
      icon: CalendarDays,
      cost: 50,
      description: 'Detailed monthly forecast for the entire month ahead',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-50',
      hoverBg: 'hover:bg-cyan-50',
      hoverBorder: 'hover:border-cyan-300',
      href: '/fortune/monthly',
      active: pathname === '/fortune/monthly'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="flex">
        {/* Left Sidebar Menu */}
        <div className="w-72 min-h-screen bg-white border-r border-stone-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-800">Fortune Center</h1>
              <p className="text-xs text-stone-500">Explore your destiny</p>
            </div>
          </div>

          {/* Coins Display */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6">
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
              className="mt-3 block text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2 bg-white rounded-lg"
            >
              View History →
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-2">
            {fortuneTypes.map((fortune) => {
              const Icon = fortune.icon
              return (
                <Link
                  key={fortune.id}
                  href={fortune.href}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    fortune.active
                      ? `bg-gradient-to-r ${fortune.color} text-white shadow-lg`
                      : `${fortune.bgColor} ${fortune.hoverBg} border border-transparent ${fortune.hoverBorder}`
                  }`}
                >
                  <span className="text-xl">{fortune.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-semibold ${fortune.active ? 'text-white' : 'text-stone-800'}`}>
                      {fortune.name}
                    </p>
                    <p className={`text-xs ${fortune.active ? 'text-white/80' : 'text-stone-500'}`}>
                      {fortune.cost} coins
                    </p>
                  </div>
                  {points < fortune.cost && !fortune.active && (
                    <span className="text-xs text-red-500">Low</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Fortune Guide */}
          <div className="mt-6 pt-6 border-t border-stone-100">
            <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Fortune Guide
            </h3>
            <div className="space-y-2 text-xs text-stone-500">
              <p>• <strong>Daily</strong>: 5 coins, once per day</p>
              <p>• <strong>Weekly</strong>: 20 coins, once per week</p>
              <p>• <strong>Monthly</strong>: 50 coins, once per month</p>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-stone-800 mb-2">Welcome to Fortune Center</h2>
              <p className="text-stone-500">Choose a fortune type from the menu to explore your destiny</p>
            </div>

            {/* Fortune Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {fortuneTypes.map((fortune) => {
                const Icon = fortune.icon
                return (
                  <Link
                    key={fortune.id}
                    href={fortune.href}
                    className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 border-2 ${
                      fortune.active
                        ? `border-amber-400 ${fortune.bgColor}`
                        : 'border-transparent hover:border-stone-200'
                    } ${points < fortune.cost ? 'opacity-60' : ''}`}
                  >
                    <div className={`w-14 h-14 ${fortune.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={`w-7 h-7 ${fortune.active ? 'text-white' : 'text-stone-600'}`} />
                    </div>
                    <h3 className="text-lg font-bold text-stone-800 mb-2">{fortune.name}</h3>
                    <p className="text-sm text-stone-500 mb-4">{fortune.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <Coins className="w-4 h-4" />
                        {fortune.cost} coins
                      </span>
                      <span className="inline-flex items-center gap-1 text-stone-400 text-sm">
                        Get fortune <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                    {points < fortune.cost && (
                      <p className="mt-3 text-xs text-red-500 flex items-center gap-1">
                        ⚠️ Not enough coins
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Info Card */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                How Fortune Readings Work
              </h2>
              <div className="space-y-4 text-sm text-stone-600">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">☀️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">Daily Fortune (5 coins)</p>
                    <p>Get your daily fortune including overall luck, lucky direction, and things to watch for. Available once per day.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🌙</span>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">Weekly Fortune (20 coins)</p>
                    <p>Weekly overview with trend analysis, focus areas, cautions, and lucky days for the week.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🌟</span>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">Monthly Fortune (50 coins)</p>
                    <p>Detailed monthly forecast covering career, wealth, love, and health with specific lucky days.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
