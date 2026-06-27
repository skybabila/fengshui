'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase, getUserProfile } from '@/lib/supabase'
import SidebarLayout from '@/components/SidebarLayout'
import { Calendar, Star, Coins, ArrowRight, Sun, Moon, CalendarDays } from 'lucide-react'

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
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <span className="text-2xl">🌟</span>
            </div>
            <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
          </div>
        </div>
      </SidebarLayout>
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
    <SidebarLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
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
    </SidebarLayout>
  )
}
