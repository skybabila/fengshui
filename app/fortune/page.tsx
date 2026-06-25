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
          <h2 className="text-xl font-semibold text-stone-700">加载中...</h2>
        </div>
      </div>
    )
  }

  const points = profile?.points || 0

  const fortuneTypes = [
    {
      id: 'daily',
      name: '每日运势',
      emoji: '☀️',
      cost: 5,
      description: '查看今日运势，把握每一天',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      href: '/fortune/daily'
    },
    {
      id: 'weekly',
      name: '每周运势',
      emoji: '🌙',
      cost: 20,
      description: '一周运势总览，规划未来七天',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      href: '/fortune/weekly'
    },
    {
      id: 'monthly',
      name: '每月运势',
      emoji: '🌟',
      cost: 50,
      description: '月度运势详解，展望整月运势',
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
          <h1 className="text-3xl font-bold text-stone-800 mb-2">运势中心</h1>
          <p className="text-stone-500">探索您的命运，把握人生方向</p>
        </div>

        {/* 元宝显示 */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">我的元宝</p>
              <p className="text-xl font-bold text-amber-600">{points}</p>
            </div>
          </div>
          <Link
            href="/user/points"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            查看明细 →
          </Link>
        </div>

        {/* 运势类型选择 */}
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
                  {fortune.cost} 元宝
                </span>
                <ArrowRight className="w-5 h-5 text-stone-400" />
              </div>
              {points < fortune.cost && (
                <p className="mt-3 text-xs text-red-500">元宝不足</p>
              )}
            </Link>
          ))}
        </div>

        {/* 说明 */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            运势说明
          </h2>
          <div className="space-y-3 text-sm text-stone-600">
            <p>• <strong>每日运势</strong>：消耗 5 元宝，每天可查看一次，包含今日综合运势、幸运方位、注意事项等。</p>
            <p>• <strong>每周运势</strong>：消耗 20 元宝，每周可查看一次，提供一周运势趋势、重点日期提醒。</p>
            <p>• <strong>每月运势</strong>：消耗 50 元宝，每月可查看一次，详细解读整月运势走向、关键时机。</p>
            <p className="text-amber-600">💡 每种运势按周期限制查看次数，请珍惜每次机会！</p>
          </div>
        </div>
      </div>
    </div>
  )
}