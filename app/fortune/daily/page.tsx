'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate, getTodayString } from '@/lib/utils'
import { Star, Calendar, Sparkles, Coins, ArrowRight, Clock } from 'lucide-react'

const DAILY_COST = 5 // 每次消耗5元宝

const fortuneTypes = [
  { type: '大吉', emoji: '🌟', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-100', textColor: 'text-green-600' },
  { type: '吉', emoji: '✨', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
  { type: '中吉', emoji: '🌤️', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
  { type: '小吉', emoji: '⛅', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  { type: '平', emoji: '☁️', color: 'from-gray-500 to-slate-500', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
]

const elementAdvice: Record<string, { advice: string; lucky: string; caution: string }> = {
  Wood: { advice: '今日适合成长和新开始，把握机会。', lucky: '绿色、植物、户外活动', caution: '避免冲动决策' },
  Fire: { advice: '热情和能量充沛，适合社交和创意活动。', lucky: '红色、聚会、艺术创作', caution: '避免争执冲突' },
  Earth: { advice: '稳定和踏实是今日主题，适合处理重要事务。', lucky: '黄色、自然漫步、冥想', caution: '避免过于固执' },
  Metal: { advice: '清晰和精确是今日关键，适合规划和整理。', lucky: '白色、整理收纳、专注工作', caution: '避免过度挑剔' },
  Water: { advice: '流动和适应是今日优势，适合灵活应变。', lucky: '蓝色、水上活动、反思', caution: '避免过于被动' },
}

const zodiacSigns = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const zodiacElements = ['Water', 'Earth', 'Wood', 'Wood', 'Earth', 'Fire', 'Fire', 'Earth', 'Metal', 'Metal', 'Earth', 'Water']

function getZodiacSign(year: number): string {
  const index = (year - 4) % 12
  return zodiacSigns[index]
}

function getZodiacElement(year: number): string {
  const index = (year - 4) % 12
  return zodiacElements[index]
}

export default function DailyFortunePage() {
  const [fortune, setFortune] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)
  const [hasTodayFortune, setHasTodayFortune] = useState(false)

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

        // 检查今天是否已经获取过运势
        const { data: existing } = await supabase
          .from('daily_fortunes')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('fortune_period', 'daily')
          .eq('date', getTodayString())
          .single()
        
        if (existing) {
          setFortune(existing)
          setShowResult(true)
          setHasTodayFortune(true)
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
    if (points < DAILY_COST) {
      alert(`元宝不足！每日运势需要 ${DAILY_COST} 元宝，您当前有 ${points} 元宝`)
      return
    }

    if (hasTodayFortune) {
      alert('您今天已经获取过运势了，明天再来吧！')
      return
    }

    setGenerating(true)

    try {
      // 扣除元宝
      await supabase
        .from('user_profiles')
        .update({ points: points - DAILY_COST })
        .eq('id', user.id)

      // 记录元宝交易
      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          description: '每日运势消耗',
          points: -DAILY_COST
        })

      const today = getTodayString()
      const year = new Date().getFullYear()
      const zodiac = getZodiacSign(year)
      const element = getZodiacElement(year)
      
      const randomIndex = Math.floor(Math.random() * fortuneTypes.length)
      const selectedFortune = fortuneTypes[randomIndex]

      const descriptions: Record<string, string[]> = {
        '大吉': [
          '今日运势极佳！万事顺遂，贵人相助，是开展新计划的最佳时机。',
          '大吉大利之日！能量充沛，机遇连连，把握当下必有所成。',
          '绝佳运势！心想事成，事半功倍，今日行动必有收获。',
        ],
        '吉': [
          '运势良好，诸事顺利。保持积极心态，好运自然来。',
          '吉运当头，适合处理重要事务。稳中求进，必有收获。',
          '吉祥如意，今日适合社交和合作。善缘汇聚，好事将近。',
        ],
        '中吉': [
          '运势平稳向好，循序渐进。专注当下，稳步前行。',
          '中吉运势，适合日常事务。保持耐心，细水长流。',
          '运势中等偏上，不宜冒险。稳扎稳打，渐入佳境。',
        ],
        '小吉': [
          '运势尚可，小有波折。谨慎行事，化险为夷。',
          '小吉之日，宜守不宜攻。低调行事，静待时机。',
          '运势平稳，注意细节。小心谨慎，平安度过。',
        ],
        '平': [
          '运势平淡，宜静不宜动。修身养性，等待转机。',
          '平稳之日，适合休息调整。不宜大动作，静观其变。',
          '运势一般，保持平常心。顺其自然，静待明天。',
        ],
      }

      const descIndex = Math.floor(Math.random() * descriptions[selectedFortune.type].length)
      const description = descriptions[selectedFortune.type][descIndex]

      // 生成幸运方位
      const luckyDirections = ['东方', '南方', '西方', '北方', '东南', '西南', '东北', '西北']
      const luckyDirection = luckyDirections[Math.floor(Math.random() * luckyDirections.length)]

      // 生成幸运颜色
      const luckyColors = ['红色', '黄色', '绿色', '蓝色', '白色', '紫色', '橙色', '粉色']
      const luckyColor = luckyColors[Math.floor(Math.random() * luckyColors.length)]

      // 生成幸运数字
      const luckyNumber = Math.floor(Math.random() * 9) + 1

      const { data: newFortune, error } = await supabase
        .from('daily_fortunes')
        .insert({
          user_id: user.id,
          date: today,
          fortune_type: selectedFortune.type,
          description,
          zodiac_sign: zodiac,
          element,
          fortune_period: 'daily',
        })
        .select()
        .single()

      if (error) throw error

      // 更新用户元宝
      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)

      setFortune(newFortune)
      setShowResult(true)
      setHasTodayFortune(true)
    } catch (error) {
      console.error('Error generating fortune:', error)
      alert('运势生成失败，请稍后再试')
    } finally {
      setGenerating(false)
    }
  }

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

  const currentFortune = fortuneTypes.find(f => f.type === fortune?.fortune_type)
  const points = profile?.points || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">每日运势</h1>
          <p className="text-stone-500">查看今日运势，把握每一天</p>
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
            消耗：<span className="text-amber-600 font-semibold">{DAILY_COST} 元宝</span>
          </div>
        </div>

        {showResult && fortune ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
            <div className={`bg-gradient-to-r ${currentFortune?.color} p-8 text-center text-white`}>
              <div className="text-6xl mb-4">{currentFortune?.emoji}</div>
              <h2 className="text-3xl font-bold mb-2">{fortune.fortune_type}</h2>
              <div className="flex items-center justify-center gap-2 text-white/80">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(new Date())}</span>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-stone-600 leading-relaxed text-lg">{fortune.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-stone-500 mb-1">生肖</p>
                  <p className="font-semibold text-stone-800">{fortune.zodiac_sign}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-stone-500 mb-1">五行</p>
                  <p className="font-semibold text-stone-800">{fortune.element}</p>
                </div>
              </div>

              {elementAdvice[fortune.element] && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-emerald-700 mb-3">今日指引</h3>
                  <p className="text-stone-600 text-sm mb-3"><strong>建议：</strong> {elementAdvice[fortune.element].advice}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                      ✅ {elementAdvice[fortune.element].lucky}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs">
                      ⚠️ {elementAdvice[fortune.element].caution}
                    </span>
                  </div>
                </div>
              )}

              {/* 提示明天再来 */}
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-amber-700 font-medium">您今天已经获取过运势了</p>
                <p className="text-sm text-amber-600">明天再来查看新的运势吧！</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">今日运势如何？</h2>
            <p className="text-stone-500 mb-6">
              消耗 {DAILY_COST} 元宝，获取您的专属每日运势解读
            </p>
            
            {points < DAILY_COST && (
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <p className="text-red-600">
                  元宝不足！需要 {DAILY_COST} 元宝，您当前有 {points} 元宝
                </p>
              </div>
            )}

            <button
              onClick={generateFortune}
              disabled={generating || points < DAILY_COST}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 transition-all hover:-translate-y-1 disabled:opacity-50"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  正在测算...
                </span>
              ) : (
                <>获取运势 ({DAILY_COST}元宝) <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <p className="mt-4 text-xs text-stone-400">
              每天只能获取一次运势，请珍惜机会
            </p>
          </div>
        )}
      </div>
    </div>
  )
}