'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import SidebarLayout from '@/components/SidebarLayout'
import { Sun, Sparkles, Coins, Star, Moon, Heart, Award, ArrowRight, Zap } from 'lucide-react'

const PRICE = 20

const westernZodiacs = [
  { sign: 'Aries', dates: 'Mar 21 - Apr 19', element: 'Fire', traits: 'Courageous, energetic, independent, passionate, natural leader' },
  { sign: 'Taurus', dates: 'Apr 20 - May 20', element: 'Earth', traits: 'Reliable, patient, practical, sensual, determined' },
  { sign: 'Gemini', dates: 'May 21 - Jun 20', element: 'Air', traits: 'Adaptable, curious, communicative, witty, versatile' },
  { sign: 'Cancer', dates: 'Jun 21 - Jul 22', element: 'Water', traits: 'Emotional, nurturing, intuitive, protective, empathetic' },
  { sign: 'Leo', dates: 'Jul 23 - Aug 22', element: 'Fire', traits: 'Confident, generous, creative, dramatic, warm-hearted' },
  { sign: 'Virgo', dates: 'Aug 23 - Sep 22', element: 'Earth', traits: 'Analytical, meticulous, practical, helpful, reliable' },
  { sign: 'Libra', dates: 'Sep 23 - Oct 22', element: 'Air', traits: 'Diplomatic, fair-minded, social, charming, peace-loving' },
  { sign: 'Scorpio', dates: 'Oct 23 - Nov 21', element: 'Water', traits: 'Passionate, resourceful, brave, loyal, perceptive' },
  { sign: 'Sagittarius', dates: 'Nov 22 - Dec 21', element: 'Fire', traits: 'Optimistic, adventurous, philosophical, honest, independent' },
  { sign: 'Capricorn', dates: 'Dec 22 - Jan 19', element: 'Earth', traits: 'Responsible, disciplined, ambitious, patient, practical' },
  { sign: 'Aquarius', dates: 'Jan 20 - Feb 18', element: 'Air', traits: 'Innovative, humanitarian, independent, intellectual, unique' },
  { sign: 'Pisces', dates: 'Feb 19 - Mar 20', element: 'Water', traits: 'Compassionate, artistic, intuitive, gentle, empathetic' },
]

const chineseZodiacs = [
  { animal: 'Rat', traits: 'Quick-witted, resourceful, versatile, kind, adaptable' },
  { animal: 'Ox', traits: 'Diligent, dependable, strong, determined, methodical' },
  { animal: 'Tiger', traits: 'Brave, confident, competitive, unpredictable, enthusiastic' },
  { animal: 'Rabbit', traits: 'Gentle, quiet, elegant, kind, patient' },
  { animal: 'Dragon', traits: 'Confident, charismatic, ambitious, lucky, passionate' },
  { animal: 'Snake', traits: 'Enigmatic, intelligent, wise, graceful, intuitive' },
  { animal: 'Horse', traits: 'Energetic, independent, impatient, active, freedom-loving' },
  { animal: 'Goat', traits: 'Gentle, shy, sympathetic, kind, artistic' },
  { animal: 'Monkey', traits: 'Clever, curious, playful, witty, social' },
  { animal: 'Rooster', traits: 'Observant, hardworking, courageous, confident, honest' },
  { animal: 'Dog', traits: 'Loyal, honest, protective, trustworthy, kind' },
  { animal: 'Pig', traits: 'Kind-hearted, generous, easygoing, sincere, compassionate' },
]

const lifePathInterpretations: Record<number, string> = {
  1: 'The Leader - You are a natural born leader with strong drive and ambition. Your path is about independence, innovation, and standing on your own two feet.',
  2: 'The Mediator - You are a peacemaker and diplomat. Your path is about cooperation, balance, relationships, and creating harmony around you.',
  3: 'The Creator - You are creative, expressive, and joyful. Your path is about self-expression, communication, and bringing beauty and optimism to the world.',
  4: 'The Builder - You are practical, reliable, and hardworking. Your path is about building solid foundations, structure, and lasting achievements.',
  5: 'The Adventurer - You are freedom-loving and adaptable. Your path is about change, variety, freedom, and embracing life\'s many experiences.',
  6: 'The Nurturer - You are caring, responsible, and loving. Your path is about home, family, service, and creating warmth and harmony for others.',
  7: 'The Seeker - You are analytical, introspective, and spiritual. Your path is about seeking truth, wisdom, knowledge, and inner understanding.',
  8: 'The Achiever - You are ambitious, powerful, and business-minded. Your path is about material success, authority, abundance, and responsible leadership.',
  9: 'The Humanitarian - You are compassionate, generous, and idealistic. Your path is about giving, service, forgiveness, and universal love.',
  11: 'The Visionary - You are intuitive, inspiring, and spiritually aware. Your path is about illumination, inspiration, and being a light for others.',
  22: 'The Master Builder - You are visionary and practical. Your path is about building something of lasting value that benefits many people.',
  33: 'The Master Teacher - You are deeply compassionate and wise. Your path is about unconditional love, healing, and spiritual teaching on a grand scale.',
}

function getWesternZodiac(month: number, day: number) {
  const dates = [20, 19, 21, 20, 21, 21, 22, 23, 23, 24, 22, 21]
  let index = month - 1
  if (day < dates[index]) {
    index = index - 1
  }
  if (index < 0) index = 11
  return westernZodiacs[index]
}

function getChineseZodiac(year: number) {
  const startYear = 1900
  const offset = (year - startYear) % 12
  const adjusted = offset < 0 ? offset + 12 : offset
  return chineseZodiacs[adjusted]
}

function calculateLifePath(year: number, month: number, day: number): number {
  const reduce = (n: number): number => {
    if ([11, 22, 33].includes(n)) return n
    if (n < 10) return n
    return reduce(String(n).split('').reduce((a, b) => a + parseInt(b), 0))
  }
  const yearSum = reduce(year)
  const monthSum = reduce(month)
  const daySum = reduce(day)
  let total = yearSum + monthSum + daySum
  total = reduce(total)
  return total
}

export default function ZodiacNumerologyPage() {
  const [user, setUser] = useState<any>(null)
  const [points, setPoints] = useState(0)
  const [step, setStep] = useState<'form' | 'generating' | 'result'>('form')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const profile = await getUserProfile(user.id)
        setPoints(profile?.points || 0)
      }
    }
    loadUser()
  }, [])

  const handleGenerate = async () => {
    if (!birthDate) {
      alert('Please enter your birth date')
      return
    }
    if (points < PRICE) {
      alert('Not enough coins!')
      return
    }

    setStep('generating')

    try {
      const [year, month, day] = birthDate.split('-').map(Number)
      
      const westernZodiac = getWesternZodiac(month, day)
      const chineseZodiac = getChineseZodiac(year)
      const lifePath = calculateLifePath(year, month, day)

      const report = {
        westernZodiac,
        chineseZodiac,
        lifePath,
        lifePathMeaning: lifePathInterpretations[lifePath] || lifePathInterpretations[lifePath % 9] || lifePathInterpretations[1],
        comprehensive: `Combined dual-system analysis shows your unique temperament blends ${westernZodiac.sign}'s ${westernZodiac.element} energy with ${chineseZodiac.animal}'s inherent qualities. Your Life Path ${lifePath} reveals your core life theme and natural direction of growth. This unique combination gives you specific interpersonal advantages, growth opportunities, and areas for gentle adjustment along your journey.`,
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: points - PRICE })
        .eq('id', user.id)
      
      if (updateError) throw updateError
      setPoints(prev => prev - PRICE)

      await supabase
        .from('zodiac_reports')
        .insert({
          user_id: user.id,
          birth_date: birthDate,
          birth_time: birthTime || null,
          report_data: report,
          coins_spent: PRICE,
        })

      setResult(report)

      setTimeout(() => {
        setStep('result')
      }, 2000)
    } catch (err) {
      alert('Failed to generate report. Please try again.')
      setStep('form')
    }
  }

  const canAfford = points >= PRICE

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-4">
              <Sun className="w-5 h-5 text-amber-600" />
              <span className="text-amber-700 text-sm font-medium">Zodiac + Numerology Report</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-3">
              Western Zodiac + Chinese Zodiac + Life Path Numerology Full Report
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Dual cultural analysis of your personality, natural traits, interpersonal energy 
              and life rhythm based on your birth information.
            </p>
          </div>

          {step === 'form' && (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="text-center">
                  <Sun className="w-10 h-10 text-amber-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Western</p>
                </div>
                <div className="text-center">
                  <Moon className="w-10 h-10 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Chinese</p>
                </div>
                <div className="text-center">
                  <Star className="w-10 h-10 text-purple-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Numerology</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Birth Time <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-slate-600">Full Report</span>
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <span className="text-2xl font-bold text-slate-800">{PRICE}</span>
                      <span className="text-slate-500">Coins</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={!canAfford || !birthDate}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    {!canAfford ? 'Not Enough Coins' : 'Generate Your Report'}
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <p className="text-center text-sm text-slate-400 mt-4">
                    Your balance: {points.toLocaleString()} Coins
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-16 text-center">
              <div className="inline-block relative mb-6">
                <div className="w-24 h-24 border-4 border-amber-200 rounded-full animate-spin absolute inset-0 border-t-amber-500" />
                <div className="w-24 h-24 flex items-center justify-center relative">
                  <Star className="w-12 h-12 text-amber-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Calculating Your Chart</h2>
              <p className="text-slate-500">Analyzing zodiac signs and life path number...</p>
            </div>
          )}

          {step === 'result' && result && (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setStep('form')
                  setResult(null)
                  setBirthDate('')
                  setBirthTime('')
                }}
                className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2"
              >
                ← Generate Another Report
              </button>

              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Your Full Personal Analysis</h2>
                    <p className="text-slate-500">Dual System + Numerology Report</p>
                  </div>
                </div>

                <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5" />
                    1. Western Zodiac Personality Traits
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                      ☀️
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-2xl font-bold text-slate-800">{result.westernZodiac.sign}</h4>
                        <span className="px-3 py-1 bg-white rounded-full text-sm text-slate-600 shadow-sm">
                          {result.westernZodiac.element} Sign
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{result.westernZodiac.dates}</p>
                      <p className="text-orange-700 leading-relaxed">
                        Your sun sign shapes your core personality, emotional expression and natural behavior style.
                        As a {result.westernZodiac.sign}, you are naturally {result.westernZodiac.traits}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <Moon className="w-5 h-5" />
                    2. Chinese Zodiac Energy Attributes
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                      🐾
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-2xl font-bold text-slate-800">Year of the {result.chineseZodiac.animal}</h4>
                      </div>
                      <p className="text-blue-700 leading-relaxed">
                        Your birth animal represents your innate life energy, advantages, temperament and life tendencies.
                        The {result.chineseZodiac.animal} carries qualities of being {result.chineseZodiac.traits}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    3. Life Path Number Interpretation
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-white">{result.lifePath}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-800 mb-2">
                        Life Path Number {result.lifePath}
                      </h4>
                      <p className="text-purple-700 leading-relaxed">
                        {result.lifePathMeaning}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    4. Comprehensive Personal Energy Summary
                  </h3>
                  <p className="text-emerald-700 leading-relaxed">
                    {result.comprehensive}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/70 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Core Strength</p>
                      <p className="font-semibold text-slate-700">{result.westernZodiac.traits.split(',')[0]}</p>
                    </div>
                    <div className="p-3 bg-white/70 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Innate Quality</p>
                      <p className="font-semibold text-slate-700">{result.chineseZodiac.traits.split(',')[0]}</p>
                    </div>
                    <div className="p-3 bg-white/70 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Life Theme</p>
                      <p className="font-semibold text-slate-700">Path {result.lifePath} Expression</p>
                    </div>
                    <div className="p-3 bg-white/70 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Growth Direction</p>
                      <p className="font-semibold text-slate-700">Self-Discovery & Balance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 max-w-2xl mx-auto text-center">
            <p className="text-slate-400 text-sm">
              All analysis content is based on traditional folk culture and modern spiritual wellness guidance. 
              All services are for entertainment and personal reflection only. 
              It does not constitute medical, legal, investment or life prediction advice.
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
