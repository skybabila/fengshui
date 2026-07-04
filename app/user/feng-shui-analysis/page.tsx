'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import SidebarLayout from '@/components/SidebarLayout'
import { Palette, Coins, Sparkles, Home, Wind, Sun, Leaf, Droplets, ArrowRight, Clock } from 'lucide-react'

const PRICE = 35
const DAILY_LIMIT = 2

const spaceTypes = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'rental', label: 'Rental Space' },
  { value: 'office', label: 'Office' },
  { value: 'studio', label: 'Studio' },
]

const mainConcerns = [
  { value: 'career', label: 'Career & Work' },
  { value: 'relationship', label: 'Relationship & Family' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'wealth', label: 'Wealth & Abundance' },
  { value: 'peace', label: 'Inner Peace & Calm' },
]

export default function FengShuiAnalysisPage() {
  const [user, setUser] = useState<any>(null)
  const [points, setPoints] = useState(0)
  const [step, setStep] = useState<'form' | 'analyzing' | 'result'>('form')
  const [spaceType, setSpaceType] = useState('')
  const [layout, setLayout] = useState('')
  const [concern, setConcern] = useState('')
  const [improvement, setImprovement] = useState('')
  const [todayCount, setTodayCount] = useState(0)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const profile = await getUserProfile(user.id)
        setPoints(profile?.points || 0)
        loadTodayUsage(user.id)
      }
    }
    loadUser()
  }, [])

  const loadTodayUsage = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabase
      .from('fengshui_reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today + 'T00:00:00')
    
    setTodayCount(count || 0)
  }

  const generateReport = async (): Promise<any> => {
    const spaceLabel = spaceTypes.find(t => t.value === spaceType)?.label || spaceType
    const concernLabel = mainConcerns.find(c => c.value === concern)?.label || concern

    const prompt = `You are a professional Feng Shui consultant. Please analyze the following space and provide a detailed energy report.

Space Type: ${spaceLabel}
Layout Description: ${layout}
Main Concern: ${concernLabel}
Improvement Goal: ${improvement}

Please provide your analysis in the following JSON format (return ONLY valid JSON, no markdown):
{
  "energyState": "Your analysis of the current space energy state, 2-3 sentences",
  "fiveElements": {
    "wood": {"score": <number 30-90>, "item": "one suggestion item for wood element"},
    "fire": {"score": <number 30-90>, "item": "one suggestion item for fire element"},
    "earth": {"score": <number 30-90>, "item": "one suggestion item for earth element"},
    "metal": {"score": <number 30-90>, "item": "one suggestion item for metal element"},
    "water": {"score": <number 30-90>, "item": "one suggestion item for water element"}
  },
  "directionEnergy": "Analysis of direction energy and corner positions, 2-3 sentences",
  "suggestions": ["specific suggestion 1", "specific suggestion 2", "specific suggestion 3", "specific suggestion 4", "specific suggestion 5"],
  "wellness": "Wellness guidance after adjustment, 2-3 sentences"
}

Important guidelines:
- Focus on wellness, positive energy, and space harmony
- Provide specific, practical suggestions based on the user's actual layout
- Do not make definitive predictions
- All content is for entertainment and personal reflection only`

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: [],
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const reply = data.reply || ''

      // Try to extract JSON from the reply
      const jsonMatch = reply.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        // Validate and fill defaults
        return {
          energyState: parsed.energyState || '',
          fiveElements: parsed.fiveElements || generateFallbackReport().fiveElements,
          directionEnergy: parsed.directionEnergy || '',
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
          wellness: parsed.wellness || '',
        }
      }
      throw new Error('No JSON in AI reply')
    } catch (error) {
      console.error('Feng Shui AI call failed, using fallback:', error)
      return generateFallbackReport()
    }
  }

  const generateFallbackReport = () => {
    const woodItems = ['Green plants', 'Wooden decor', 'Natural materials', 'Fresh flowers']
    const fireItems = ['Warm lighting', 'Candles', 'Red accents', 'Sunlight']
    const earthItems = ['Stable furniture', 'Ceramic pieces', 'Earth tones', 'Crystals']
    const metalItems = ['Metal accents', 'Round shapes', 'White/metallic colors', 'Mirrors']
    const waterItems = ['Water fountain', 'Aquarium', 'Blue/black colors', 'Flowing shapes']

    const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

    return {
      energyState: `Your current living space has relatively smooth overall energy, with a few minor stagnant areas that affect daily comfort and mental stability. The ${spaceType} layout you described shows potential for improved energy flow in the ${concern} area of your life.`,
      fiveElements: {
        wood: { score: 60 + Math.floor(Math.random() * 30), item: getRandom(woodItems) },
        fire: { score: 50 + Math.floor(Math.random() * 40), item: getRandom(fireItems) },
        earth: { score: 70 + Math.floor(Math.random() * 25), item: getRandom(earthItems) },
        metal: { score: 45 + Math.floor(Math.random() * 35), item: getRandom(metalItems) },
        water: { score: 55 + Math.floor(Math.random() * 30), item: getRandom(waterItems) },
      },
      directionEnergy: `Some corner positions in your space accumulate stagnant energy. Long-term accumulation easily causes restless mood and trivial troubles. The main entrance and window areas show moderate energy flow that can be enhanced. Pay attention to the northeast and southwest corners for potential energy blocks.`,
      suggestions: [
        `Add ${getRandom(woodItems).toLowerCase()} to activate vitality and growth energy`,
        `Keep windows clean for smooth air flow and natural light circulation`,
        `Tidy up blind corners and remove clutter from under furniture`,
        `Avoid sharp structures facing your main activity area (desk, bed, sofa)`,
        `Place ${getRandom(waterItems).toLowerCase()} in the wealth area to invite flowing abundance`,
      ],
      wellness: `After proper adjustment, your home energy will become softer, quieter and more conducive to rest, work and family harmony. Small consistent changes create cumulative positive effects on your daily well-being and mental clarity.`,
    }
  }

  const handleAnalyze = async () => {
    if (!spaceType || !layout || !concern || !improvement) {
      alert('Please fill in all fields')
      return
    }
    if (todayCount >= DAILY_LIMIT) {
      alert('Daily limit reached. Try again tomorrow!')
      return
    }
    if (points < PRICE) {
      alert('Not enough coins!')
      return
    }

    setStep('analyzing')

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: points - PRICE })
        .eq('id', user.id)
      
      if (updateError) throw updateError
      setPoints(prev => prev - PRICE)

      const report = await generateReport()

      const { error: insertError } = await supabase
        .from('fengshui_reports')
        .insert({
          user_id: user.id,
          space_type: spaceType,
          layout_description: layout,
          main_concern: concern,
          improvement_goal: improvement,
          report_data: report,
          coins_spent: PRICE,
        })
      
      if (insertError) throw insertError

      setResult(report)
      setTodayCount(prev => prev + 1)

      setTimeout(() => {
        setStep('result')
      }, 2500)
    } catch (err) {
      alert('Failed to generate report. Please try again.')
      setStep('form')
    }
  }

  const canAfford = points >= PRICE
  const hasLimit = todayCount < DAILY_LIMIT

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-4">
              <Palette className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-700 text-sm font-medium">Home & Office Feng Shui</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-3">
              Space Energy Diagnosis & Five Elements Optimization
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Analyze your room layout, direction energy and five elements balance. 
              Get professional space improvement suggestions for better living energy.
            </p>
          </div>

          {step === 'form' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span className="text-slate-600">Price per report: <strong className="text-slate-800">{PRICE} Coins</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-500" />
                  <span className="text-slate-600">
                    <strong className={hasLimit ? 'text-emerald-600' : 'text-red-500'}>
                      {DAILY_LIMIT - todayCount}
                    </strong> / {DAILY_LIMIT} today
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Space Type
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {spaceTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSpaceType(type.value)}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          spaceType === type.value
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Describe Your Space Layout
                  </label>
                  <textarea
                    value={layout}
                    onChange={(e) => setLayout(e.target.value)}
                    placeholder="e.g., 2-bedroom apartment facing south, kitchen in the east, bedroom in the west..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 placeholder-slate-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Main Area of Concern
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {mainConcerns.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setConcern(c.value)}
                        className={`px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          concern === c.value
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What Do You Want to Improve?
                  </label>
                  <textarea
                    value={improvement}
                    onChange={(e) => setImprovement(e.target.value)}
                    placeholder="Describe the changes you want to see in your home energy and daily life..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 placeholder-slate-400 resize-none"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!canAfford || !hasLimit || !spaceType || !layout || !concern || !improvement}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  {!hasLimit ? 'Daily Limit Reached' : !canAfford ? 'Not Enough Coins' : 'Generate Energy Report'}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-sm text-slate-400">
                  Your balance: {points.toLocaleString()} Coins
                </p>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
              <div className="inline-block relative mb-6">
                <div className="w-24 h-24 border-4 border-emerald-200 rounded-full animate-ping absolute inset-0" />
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center relative">
                  <Wind className="w-12 h-12 text-white animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Your Space</h2>
              <p className="text-slate-500">Calculating five elements balance and energy flow...</p>
              <div className="mt-6 flex justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {step === 'result' && result && (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setStep('form')
                  setResult(null)
                  setSpaceType('')
                  setLayout('')
                  setConcern('')
                  setImprovement('')
                }}
                className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2"
              >
                ← Generate Another Report
              </button>

              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Your Space Energy Report</h2>
                    <p className="text-slate-500">Five Elements Balance Analysis</p>
                  </div>
                </div>

                <div className="mb-8 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    1. Current Space Energy State
                  </h3>
                  <p className="text-emerald-700 leading-relaxed">{result.energyState}</p>
                </div>

                <div className="mb-8">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-emerald-500" />
                    2. Five Elements Balance Analysis
                  </h3>
                  <div className="grid grid-cols-5 gap-4">
                    {Object.entries(result.fiveElements).map(([element, data]: [string, any]) => (
                      <div key={element} className="text-center">
                        <div className="relative w-full h-32 bg-slate-100 rounded-xl overflow-hidden mb-2">
                          <div
                            className={`absolute bottom-0 w-full transition-all duration-1000 rounded-t-xl ${
                              element === 'wood' ? 'bg-green-500' :
                              element === 'fire' ? 'bg-red-500' :
                              element === 'earth' ? 'bg-amber-600' :
                              element === 'metal' ? 'bg-slate-400' :
                              'bg-blue-500'
                            }`}
                            style={{ height: `${data.score}%` }}
                          />
                          <div className="absolute inset-0 flex items-end justify-center pb-2">
                            <span className="text-white font-bold text-lg drop-shadow">{data.score}</span>
                          </div>
                        </div>
                        <p className="font-semibold text-slate-700 capitalize">{element}</p>
                        <p className="text-xs text-slate-500 mt-1">{data.item}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-slate-600">
                    Your space shows a balanced foundation with earth energy providing stability. 
                    Enhancing wood and water elements can bring more vitality and flowing abundance.
                  </p>
                </div>

                <div className="mb-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <Sun className="w-5 h-5" />
                    3. Direction Energy Evaluation
                  </h3>
                  <p className="text-amber-700 leading-relaxed">{result.directionEnergy}</p>
                </div>

                <div className="mb-8">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    4. Professional Optimization Suggestions
                  </h3>
                  <div className="space-y-3">
                    {result.suggestions.map((s: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-emerald-700 font-bold text-sm">{i + 1}</span>
                        </div>
                        <p className="text-slate-700">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                  <h3 className="font-bold text-cyan-800 mb-2 flex items-center gap-2">
                    <Droplets className="w-5 h-5" />
                    5. Wellness Guidance
                  </h3>
                  <p className="text-cyan-700 leading-relaxed">{result.wellness}</p>
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
