'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate, getTodayString, getWeekNumber, getYear } from '@/lib/utils'
import { Star, Calendar, Sparkles, Coins, ArrowRight, Clock } from 'lucide-react'

const WEEKLY_COST = 20 // 每次消耗20元宝

const fortuneTypes = [
  { type: '大吉', emoji: '🌟', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-100', textColor: 'text-green-600' },
  { type: '吉', emoji: '✨', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
  { type: '中吉', emoji: '🌤️', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
  { type: '小吉', emoji: '⛅', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  { type: '平', emoji: '☁️', color: 'from-gray-500 to-slate-500', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
]

const weekAdvice: Record<string, { overview: string; focus: string; caution: string; luckyDays: string[] }> = {
  '大吉': {
    overview: '本周运势极佳，万事顺遂，贵人相助，是开展新计划的最佳时机。',
    focus: '抓住机遇，大胆行动，适合启动新项目或重要决策。',
    caution: '保持谦逊，不要过于张扬。',
    luckyDays: ['周一', '周三', '周五']
  },
  '吉': {
    overview: '运势良好，诸事顺利。保持积极心态，好运自然来。',
    focus: '稳中求进，适合社交活动和合作项目。',
    caution: '注意细节，避免粗心大意。',
    luckyDays: ['周二', '周四']
  },
  '中吉': {
    overview: '运势平稳向好，循序渐进。专注当下，稳步前行。',
    focus: '按计划行事，不宜冒险。',
    caution: '保持耐心，不要急于求成。',
    luckyDays: ['周三', '周六']
  },
  '小吉': {
    overview: '运势尚可，小有波折。谨慎行事，化险为夷。',
    focus: '低调行事，专注本职工作。',
    caution: '避免冲动决策，多听取他人意见。',
    luckyDays: ['周五']
  },
  '平': {
    overview: '运势平淡，宜静不宜动。修身养性，等待转机。',
    focus: '适合休息调整，不宜大动作。',
    caution: '保持平常心，顺其自然。',
    luckyDays: ['周日']
  },
}

export default function WeeklyFortunePage() {
  const [fortune, setFortune] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)
  const [hasWeekFortune, setHasWeekFortune] = useState(false)

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

        const currentWeek = getWeekNumber()
        const currentYear = getYear()

        // 检查本周是否已经获取过运势
        const { data: existing } = await supabase
          .from('daily_fortunes')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('fortune_period', 'weekly')
          .eq('week_number', currentWeek)
          .eq('year', currentYear)
          .single()
        
        if (existing) {
          setFortune(existing)
          setShowResult(true)
          setHasWeekFortune(true)
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
    if (points < WEEKLY_COST) {
      alert(`元宝不足！每周运势需要 ${WEEKLY_COST} 元宝，您当前有 ${points} 元宝`)
      return
    }

    if (hasWeekFortune) {
      alert('您本周已经获取过运势了，下周再来吧！')
      return
    }

    setGenerating(true)

    try {
      // 扣除元宝
      await supabase
        .from('user_profiles')
        .update({ points: points - WEEKLY_COST })
        .eq('id', user.id)

      // 记录元宝交易
      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          description: '每周运势消耗',
          points: -WEEKLY_COST
        })

      const currentWeek = getWeekNumber()
      const currentYear = getYear()
      
      const randomIndex = Math.floor(Math.random() * fortuneTypes.length)
      const selectedFortune = fortuneTypes[randomIndex]

      const advice = weekAdvice[selectedFortune.type]

      // 生成幸运方位
      const luckyDirections = ['东方', '南方', '西方', '北方', '东南', '西南', '东北', '西北']
      const luckyDirection = luckyDirections[Math.floor(Math.random() * luckyDirections.length)]

      // 生成幸运颜色
      const luckyColors = ['红色', '黄色', '绿色', '蓝色', '白色', '紫色', '橙色', '粉色']
      const luckyColor = luckyColors[Math.floor(Math.random() * luckyColors.length)]

      const { data: newFortune, error } = await supabase
        .from('daily_fortunes')
        .insert({
          user_id: user.id,
          date: getTodayString(),
          fortune_type: selectedFortune.type,
          description: advice.overview,
          fortune_period: 'weekly',
          week_number: currentWeek,
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
      setHasWeekFortune(true)
    } catch (error) {
      console.error('Error generating fortune:', error)
      alert('运势生成失败，请稍后再试')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-2xl">🌙</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-700">加载中...</h2>
        </div>
      </div>
    )
  }

  const currentFortune = fortuneTypes.find(f => f.type === fortune?.fortune_type)
  const points = profile?.points || 0
  const currentWeek = getWeekNumber()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">每周运势</h1>
          <p className="text-stone-500">第 {currentWeek} 周 · {getYear()}年</p>
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
            消耗：<span className="text-purple-600 font-semibold">{WEEKLY_COST} 元宝</span>
          </div>
        </div>

        {showResult && fortune ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
            <div className={`bg-gradient-to-r ${currentFortune?.color} p-8 text-center text-white`}>
              <div className="text-6xl mb-4">{currentFortune?.emoji}</div>
              <h2 className="text-3xl font-bold mb-2">{fortune.fortune_type}</h2>
              <div className="flex items-center justify-center gap-2 text-white/80">
                <Calendar className="w-4 h-4" />
                <span>第 {fortune.week_number} 周 · {fortune.year}年</span>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-stone-600 leading-relaxed text-lg">{fortune.description}</p>
              </div>

              {weekAdvice[fortune.fortune_type] && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-sm text-purple-500 mb-1">本周重点</p>
                      <p className="text-stone-700 font-medium">{weekAdvice[fortune.fortune_type].focus}</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4">
                      <p className="text-sm text-orange-500 mb-1">注意事项</p>
                      <p className="text-stone-700 font-medium">{weekAdvice[fortune.fortune_type].caution}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-purple-700 mb-3">幸运日期</h3>
                    <div className="flex flex-wrap gap-2">
                      {weekAdvice[fortune.fortune_type].luckyDays.map(day => (
                        <span key={day} className="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                          ✨ {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 提示下周再来 */}
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-purple-700 font-medium">您本周已经获取过运势了</p>
                <p className="text-sm text-purple-600">下周再来查看新的运势吧！</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-12 h-12 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">本周运势如何？</h2>
            <p className="text-stone-500 mb-6">
              消耗 {WEEKLY_COST} 元宝，获取您的专属每周运势解读
            </p>
            
            {points < WEEKLY_COST && (
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <p className="text-red-600">
                  元宝不足！需要 {WEEKLY_COST} 元宝，您当前有 {points} 元宝
                </p>
              </div>
            )}

            <button
              onClick={generateFortune}
              disabled={generating || points < WEEKLY_COST}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transition-all hover:-translate-y-1 disabled:opacity-50"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  正在测算...
                </span>
              ) : (
                <>获取运势 ({WEEKLY_COST}元宝) <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <p className="mt-4 text-xs text-stone-400">
              每周只能获取一次运势，请珍惜机会
            </p>
          </div>
        )}
      </div>
    </div>
  )
}