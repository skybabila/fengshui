'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate, getTodayString, getMonthNumber, getYear } from '@/lib/utils'
import { Star, Calendar, Sparkles, Coins, ArrowRight, Clock } from 'lucide-react'

const MONTHLY_COST = 50 // 每次消耗50元宝

const fortuneTypes = [
  { type: '大吉', emoji: '🌟', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-100', textColor: 'text-green-600' },
  { type: '吉', emoji: '✨', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
  { type: '中吉', emoji: '🌤️', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
  { type: '小吉', emoji: '⛅', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  { type: '平', emoji: '☁️', color: 'from-gray-500 to-slate-500', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
]

const monthAdvice: Record<string, { overview: string; career: string; wealth: string; love: string; health: string; luckyDays: number[] }> = {
  '大吉': {
    overview: '本月运势极佳，万事顺遂，贵人相助，是开展新计划的最佳时机。',
    career: '事业运势旺盛，适合开拓新领域，把握机遇必有收获。',
    wealth: '财运亨通，投资理财皆有利，但需谨慎决策。',
    love: '感情运势良好，单身者有望遇良缘，已婚者感情升温。',
    health: '健康状况良好，精力充沛，适合增加运动量。',
    luckyDays: [3, 8, 15, 22, 28]
  },
  '吉': {
    overview: '运势良好，诸事顺利。保持积极心态，好运自然来。',
    career: '工作稳定进展，适合稳步推进项目，不宜冒险。',
    wealth: '财运平稳，收入稳定，适合储蓄理财。',
    love: '感情和谐，适合增进沟通，化解误会。',
    health: '健康尚可，注意作息规律，避免熬夜。',
    luckyDays: [5, 12, 20]
  },
  '中吉': {
    overview: '运势平稳向好，循序渐进。专注当下，稳步前行。',
    career: '工作按部就班，不宜大动作，保持耐心。',
    wealth: '财运中等，收支平衡，不宜大额投资。',
    love: '感情平稳，适合培养感情，不宜急躁。',
    health: '健康一般，注意饮食健康，适度运动。',
    luckyDays: [7, 14, 21]
  },
  '小吉': {
    overview: '运势尚可，小有波折。谨慎行事，化险为夷。',
    career: '工作有小挑战，保持谨慎，多听取建议。',
    wealth: '财运偏弱，控制开支，避免冲动消费。',
    love: '感情有小波折，需要耐心沟通。',
    health: '注意休息，避免过度劳累。',
    luckyDays: [10, 25]
  },
  '平': {
    overview: '运势平淡，宜静不宜动。修身养性，等待转机。',
    career: '工作平稳，不宜变动，静观其变。',
    wealth: '财运一般，谨慎理财，避免风险。',
    love: '感情平淡，适合独处反思。',
    health: '注意养生，保持平和心态。',
    luckyDays: [18]
  },
}

const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

export default function MonthlyFortunePage() {
  const [fortune, setFortune] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)
  const [hasMonthFortune, setHasMonthFortune] = useState(false)

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

        const currentMonth = getMonthNumber()
        const currentYear = getYear()

        // 检查本月是否已经获取过运势
        const { data: existing } = await supabase
          .from('daily_fortunes')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('fortune_period', 'monthly')
          .eq('month_number', currentMonth)
          .eq('year', currentYear)
          .single()
        
        if (existing) {
          setFortune(existing)
          setShowResult(true)
          setHasMonthFortune(true)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const generateFortune = async () => {
    if (!user) {
      alert('请登录后获取运势')
      return
    }

    const points = profile?.points || 0
    if (points < MONTHLY_COST) {
      alert(`元宝不足！每月运势需要 ${MONTHLY_COST} 元宝，您当前有 ${points} 元宝`)
      return
    }

    if (hasMonthFortune) {
      alert('您本月已经获取过运势了，下月再来吧！')
      return
    }

    setGenerating(true)

    try {
      // 扣除元宝
      await supabase
        .from('user_profiles')
        .update({ points: points - MONTHLY_COST })
        .eq('id', user.id)

      // 记录元宝交易
      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          description: '每月运势消耗',
          points: -MONTHLY_COST
        })

      const currentMonth = getMonthNumber()
      const currentYear = getYear()
      
      const randomIndex = Math.floor(Math.random() * fortuneTypes.length)
      const selectedFortune = fortuneTypes[randomIndex]

      const advice = monthAdvice[selectedFortune.type]

      const { data: newFortune, error } = await supabase
        .from('daily_fortunes')
        .insert({
          user_id: user.id,
          date: getTodayString(),
          fortune_type: selectedFortune.type,
          description: advice.overview,
          fortune_period: 'monthly',
          month_number: currentMonth,
          year: currentYear,
        })
        .select()
        .single()

      if (error) throw error

      // 更新用户元宝
      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)

      setFortune(newFortune)
      setShowResult(true)
      setHasMonthFortune(true)
    } catch (error) {
      console.error('Error generating fortune:', error)
      alert('运势生成失败，请稍后再试')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-2xl">🌟</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-700">加载中...</h2>
        </div>
      </div>
    )
  }

  const currentFortune = fortuneTypes.find(f => f.type === fortune?.fortune_type)
  const points = profile?.points || 0
  const currentMonth = getMonthNumber()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">每月运势</h1>
          <p className="text-stone-500">{monthNames[currentMonth - 1]} · {getYear()}年</p>
        </div>

        {/* 元宝显示 */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">我的元宝</p>
              <p className="text-xl font-bold text-amber-600">{points}</p>
            </div>
          </div>
          <div className="text-sm text-stone-500">
            消耗：<span className="text-cyan-600 font-semibold">{MONTHLY_COST} 元宝</span>
          </div>
        </div>

        {showResult && fortune ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
            <div className={`bg-gradient-to-r ${currentFortune?.color} p-8 text-center text-white`}>
              <div className="text-6xl mb-4">{currentFortune?.emoji}</div>
              <h2 className="text-3xl font-bold mb-2">{fortune.fortune_type}</h2>
              <div className="flex items-center justify-center gap-2 text-white/80">
                <Calendar className="w-4 h-4" />
                <span>{monthNames[fortune.month_number - 1]} · {fortune.year}年</span>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-stone-600 leading-relaxed text-lg">{fortune.description}</p>
              </div>

              {monthAdvice[fortune.fortune_type] && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm text-blue-500 mb-1">💼 事业运</p>
                      <p className="text-stone-700 text-sm">{monthAdvice[fortune.fortune_type].career}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm text-amber-500 mb-1">💰 财运</p>
                      <p className="text-stone-700 text-sm">{monthAdvice[fortune.fortune_type].wealth}</p>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-4">
                      <p className="text-sm text-pink-500 mb-1">💕 情感运</p>
                      <p className="text-stone-700 text-sm">{monthAdvice[fortune.fortune_type].love}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm text-green-500 mb-1">🏥 健康运</p>
                      <p className="text-stone-700 text-sm">{monthAdvice[fortune.fortune_type].health}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-cyan-700 mb-3">本月幸运日期</h3>
                    <div className="flex flex-wrap gap-2">
                      {monthAdvice[fortune.fortune_type].luckyDays.map(day => (
                        <span key={day} className="inline-flex items-center bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
                          ✨ {day}日
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 提示下月再来 */}
              <div className="bg-cyan-50 rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                <p className="text-cyan-700 font-medium">您本月已经获取过运势了</p>
                <p className="text-sm text-cyan-600">下月再来查看新的运势吧！</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-12 h-12 text-cyan-500" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">本月运势如何？</h2>
            <p className="text-stone-500 mb-6">
              消耗 {MONTHLY_COST} 元宝，获取您的专属每月运势详解
            </p>
            
            {points < MONTHLY_COST && (
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <p className="text-red-600">
                  元宝不足！需要 {MONTHLY_COST} 元宝，您当前有 {points} 元宝
                </p>
              </div>
            )}

            <button
              onClick={generateFortune}
              disabled={generating || points < MONTHLY_COST}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-200 hover:shadow-xl hover:shadow-cyan-300 transition-all hover:-translate-y-1 disabled:opacity-50"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  正在测算...
                </span>
              ) : (
                <>获取运势 ({MONTHLY_COST}元宝) <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <p className="mt-4 text-xs text-stone-400">
              每月只能获取一次运势，请珍惜机会
            </p>
          </div>
        )}
      </div>
    </div>
  )
}