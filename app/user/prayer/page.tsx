'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Flame, Coins, Star, Heart, Sparkles, Clock, CheckCircle2, TrendingUp, Scroll, Cloud, Sunrise, Mountain, Sun, Volume2 } from 'lucide-react'

// Chinese Deities for Worship System - 6 most popular for overseas audience
const deities = [
  { 
    id: 'caishen', 
    name: 'God of Wealth', 
    deity: 'Caishen',
    emoji: '🧧', 
    cost: 30, 
    blessing: 'Wealth, business income, salary growth and financial luck',
    description: 'The most revered god of prosperity. Worship him to attract steady income, new business opportunities and stable financial growth.',
    prayerEffect: 'Attract new business opportunities and stable long-term prosperity.',
    domains: ['Business profit', 'Salary raise', 'Investment luck', 'Personal wealth'],
    prayerText: 'I sincerely offer this worship to God of Wealth. May I receive continuous income, new business deals and stable financial luck. May all my money-related wishes come true.',
    image: '/deity-caishen.svg',
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    colorName: 'text-yellow-700',
  },
  { 
    id: 'guanyu', 
    name: 'Guan Yu', 
    subtitle: 'Career God',
    deity: 'Guan Yu',
    emoji: '⚔️', 
    cost: 25, 
    blessing: 'Job promotion, workplace protection and career breakthrough',
    description: 'Patron saint of professionals and entrepreneurs. He protects you from office conflict and brings advancement at work.',
    prayerEffect: 'Avoid office disputes and gain steady advancement at work.',
    domains: ['Job promotion', 'Workplace stability', 'Leadership', 'Career breakthrough'],
    prayerText: 'I sincerely offer this worship to Guan Yu. May my career flourish with steady promotion, may noble people guide my path, and may I succeed in all my professional endeavors.',
    image: '/deity-guanyu.svg',
    color: 'from-red-500 to-orange-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    iconBg: 'bg-gradient-to-br from-red-500 to-orange-500',
    colorName: 'text-red-700',
  },
  { 
    id: 'household', 
    name: 'Household Guardian', 
    deity: 'Jade Emperor Household Guardian',
    emoji: '🏠', 
    cost: 10, 
    blessing: 'Family peace, home safety and protection from bad energy',
    description: 'House guardian deity who dispels negative Qi. Keep illness and misfortune away from your family.',
    prayerEffect: 'Keep your whole family away from sickness and misfortune.',
    domains: ['Family health', 'Home safety', 'Ward off bad energy', 'Household peace'],
    prayerText: 'I sincerely offer this worship to the Household Guardian. May my family be protected from all harm and illness, may our home be filled with peace and positive energy, and may misfortune never enter our door.',
    image: '/deity-household.svg',
    color: 'from-amber-400 to-yellow-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
    colorName: 'text-amber-700',
  },
  { 
    id: 'longevity', 
    name: 'God of Longevity', 
    deity: 'Shouxing',
    emoji: '🍑', 
    cost: 15, 
    blessing: 'Physical health, vitality and wellness for family elders',
    description: 'Bless your body with vitality, ease anxiety and bring good health to you and your parents.',
    prayerEffect: 'Relieve stress and bring long-term physical and mental peace.',
    domains: ['Physical wellness', 'Recovery from sickness', 'Peace of mind', 'Long life for elders'],
    prayerText: 'I sincerely offer this worship to the God of Longevity. May my body be strong and free from illness, may my mind be calm and peaceful, and may my parents and elders enjoy long, healthy lives.',
    image: '/deity-longevity.svg',
    color: 'from-emerald-400 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    colorName: 'text-emerald-700',
  },
  { 
    id: 'yuelao', 
    name: 'Yue Lao', 
    subtitle: 'Matchmaker God',
    deity: 'Yue Lao',
    emoji: '🌹', 
    cost: 20, 
    blessing: 'Meet your soulmate, build stable and happy relationships',
    description: 'The ancient matchmaker who ties red fate threads. Pray for your destined partner and harmonious love life.',
    prayerEffect: 'Tie red fate threads and bring you harmonious marriage luck.',
    domains: ['Find a partner', 'Stable relationship', 'Happy marriage', 'Romantic luck'],
    prayerText: 'I sincerely offer this worship to Yue Lao. May my destined partner find their way to me, may our relationship be filled with love and harmony, and may we build a happy life together.',
    image: '/deity-yuelao.svg',
    color: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    iconBg: 'bg-gradient-to-br from-pink-400 to-rose-500',
    colorName: 'text-pink-700',
  },
  { 
    id: 'wenchang', 
    name: 'Wen Chang', 
    subtitle: 'God of Wisdom',
    deity: 'Wen Chang',
    emoji: '📖', 
    cost: 15, 
    blessing: 'Exam success, clear thinking and wise decisions',
    description: 'Patron of scholars and thinkers. Gain sharp judgment, pass interviews and make wise life choices.',
    prayerEffect: 'Sharpen your mind and succeed in interviews and important choices.',
    domains: ['Exam success', 'Study efficiency', 'Clear mind', 'Decision wisdom'],
    prayerText: 'I sincerely offer this worship to Wen Chang. May my mind be clear and sharp, may I succeed in all my exams and interviews, and may wisdom guide every important decision in my life.',
    image: '/deity-wenchang.svg',
    color: 'from-blue-400 to-indigo-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    colorName: 'text-blue-700',
  },
]

// Fortune Sticks - 20 unique readings
const fortuneSticks = [
  // Great Luck (5)
  { id: 1, luck: 'Great Luck', luckLevel: 'great', luckColor: 'text-yellow-500', luckBg: 'bg-yellow-50', stickNo: 1,
    poem: "Morning sunlight fills your door,\nProsperity comes more and more.\nNo barrier blocks your road ahead,\nAll your wishes will soon be spread.",
    interpretation: { wealth: "Unexpected income or new business orders will arrive soon.", career: "Leaders recognize your work, promotion opportunities are near.", love: "Stable relationship, single people will meet good matches.", health: "Full of energy, no minor illnesses." },
    deityRecommendation: { deity: 'God of Wealth', deityId: 'caishen' }
  },
  { id: 2, luck: 'Great Luck', luckLevel: 'great', luckColor: 'text-yellow-500', luckBg: 'bg-yellow-50', stickNo: 8,
    poem: "Good fate follows your every step,\nYour hard work will get its reward.\nFamily stays safe all through the year,\nJoy and wealth will always appear.",
    interpretation: { wealth: "Steady passive income keeps growing.", career: "Workplace disputes fade away smoothly.", love: "Family harmony, couples grow closer.", health: "Elders enjoy stable physical condition." },
    deityRecommendation: { deity: 'Household Guardian', deityId: 'household' }
  },
  { id: 3, luck: 'Great Luck', luckLevel: 'great', luckColor: 'text-yellow-500', luckBg: 'bg-yellow-50', stickNo: 15,
    poem: "Your mind becomes clear and bright,\nYou win success day and night.\nDoors of opportunity open wide,\nYou ride the tide with growing pride.",
    interpretation: { wealth: "Investment judgment becomes sharp.", career: "Interviews and important examinations go perfectly.", love: "Communicate smoothly with your partner.", health: "Anxiety fades, sleep quality improves greatly." },
    deityRecommendation: { deity: 'Wen Chang', deityId: 'wenchang' }
  },
  { id: 4, luck: 'Great Luck', luckLevel: 'great', luckColor: 'text-yellow-500', luckBg: 'bg-yellow-50', stickNo: 22,
    poem: "Red fate thread slowly winds along,\nYour destined love will soon belong.\nGood luck flows without any stop,\nYour happy life will rise on top.",
    interpretation: { wealth: "Small side projects bring continuous profit.", career: "New cooperative projects move forward smoothly.", love: "Singles meet soulmates; couples prepare for marriage.", health: "Peace of mind brings stable wellness." },
    deityRecommendation: { deity: 'Yue Lao', deityId: 'yuelao' }
  },
  { id: 5, luck: 'Great Luck', luckLevel: 'great', luckColor: 'text-yellow-500', luckBg: 'bg-yellow-50', stickNo: 29,
    poem: "Clouds disperse beneath the blue sky,\nYour long wait meets a reply.\nWealth and honor walk hand in hand,\nYour future stands on solid land.",
    interpretation: { wealth: "Delayed payment or owed money will be returned.", career: "Long-term efforts finally get recognized and rewarded.", love: "Relationship bottlenecks are broken successfully.", health: "Recover quickly from mild discomfort." },
    deityRecommendation: { deity: 'Guan Yu', deityId: 'guanyu' }
  },
  // Good Luck (5)
  { id: 6, luck: 'Good Luck', luckLevel: 'good', luckColor: 'text-emerald-600', luckBg: 'bg-emerald-50', stickNo: 36,
    poem: "Walk steadily on your journey,\nSmall gains build up into plenty.\nGuard your peace day after day,\nGood fortune will come your way.",
    interpretation: { wealth: "Income rises slowly and steadily; avoid speculative gambling.", career: "Step-by-step progress, no sudden setbacks.", love: "Minor quarrels can be resolved with gentle communication.", health: "Keep regular schedules to stay in good shape." },
    deityRecommendation: { deity: 'Household Guardian', deityId: 'household' }
  },
  { id: 7, luck: 'Good Luck', luckLevel: 'good', luckColor: 'text-emerald-600', luckBg: 'bg-emerald-50', stickNo: 43,
    poem: "Plant seeds within the spring rain,\nYour harvest comes without pain.\nKeep faith through waiting days,\nYour fortune grows in gentle ways.",
    interpretation: { wealth: "Long-term investment slowly brings returns.", career: "New projects start smoothly and gain gradual results.", love: "Relationship develops calmly and stably.", health: "Minor aches disappear after proper rest." },
    deityRecommendation: { deity: 'God of Longevity', deityId: 'longevity' }
  },
  { id: 8, luck: 'Good Luck', luckLevel: 'good', luckColor: 'text-emerald-600', luckBg: 'bg-emerald-50', stickNo: 50,
    poem: "Wisdom rises inside your mind,\nYou leave confusion far behind.\nMake careful plans before you act,\nYou avoid every risky trap.",
    interpretation: { wealth: "Rational financial planning avoids unnecessary losses.", career: "Clear judgment helps you win competitive chances.", love: "Think calmly before arguing with your partner.", health: "Mental stress is greatly relieved." },
    deityRecommendation: { deity: 'Wen Chang', deityId: 'wenchang' }
  },
  { id: 9, luck: 'Good Luck', luckLevel: 'good', luckColor: 'text-emerald-600', luckBg: 'bg-emerald-50', stickNo: 57,
    poem: "A gentle wind pushes your boat forward,\nYour small wishes are soon rewarded.\nStay sincere and keep your mood bright,\nGood luck stays with you day and night.",
    interpretation: { wealth: "Side hustles bring stable extra earnings.", career: "Colleagues offer help and teamwork goes well.", love: "Sweet small moments warm your relationship.", health: "Maintain light exercise to stay energetic." },
    deityRecommendation: { deity: 'Guan Yu', deityId: 'guanyu' }
  },
  { id: 10, luck: 'Good Luck', luckLevel: 'good', luckColor: 'text-emerald-600', luckBg: 'bg-emerald-50', stickNo: 64,
    poem: "Red thread draws two hearts near,\nYour true love slowly appears.\nTake your time and do not rush,\nYour happy bond will firmly hush.",
    interpretation: { wealth: "Ordinary income stays stable; no big windfalls.", career: "Daily work goes smoothly without troubles.", love: "Singles gradually meet suitable people; avoid blind impulsive relationships.", health: "Emotional stability brings physical comfort." },
    deityRecommendation: { deity: 'Yue Lao', deityId: 'yuelao' }
  },
  // Average Luck (5)
  { id: 11, luck: 'Average Luck', luckLevel: 'average', luckColor: 'text-stone-500', luckBg: 'bg-stone-50', stickNo: 71,
    poem: "Calm water flows without big waves,\nNo great gain, no heavy caves.\nHold on tight to what you own,\nWait patiently till luck is grown.",
    interpretation: { wealth: "Keep existing income; do not make large new investments today.", career: "Maintain daily work; delay signing important contracts.", love: "Keep a low profile and avoid emotional conflicts.", health: "Guard against colds and fatigue." },
    deityRecommendation: { deity: 'Household Guardian', deityId: 'household' }
  },
  { id: 12, luck: 'Average Luck', luckLevel: 'average', luckColor: 'text-stone-500', luckBg: 'bg-stone-50', stickNo: 78,
    poem: "The road ahead stays plain and slow,\nNo sudden wind of fortune will blow.\nStick to your routine step by step,\nYour steady pace avoids regret.",
    interpretation: { wealth: "Income stays flat; cut unnecessary consumption.", career: "No new promotion chances; focus on finishing current tasks.", love: "Keep a peaceful mood, do not force relationship progress.", health: "Avoid staying up late to prevent physical decline." },
    deityRecommendation: { deity: 'God of Longevity', deityId: 'longevity' }
  },
  { id: 13, luck: 'Average Luck', luckLevel: 'average', luckColor: 'text-stone-500', luckBg: 'bg-stone-50', stickNo: 85,
    poem: "Fog lightly covers the mountain road,\nPause your steps and lighten your load.\nWait until the mist drifts away,\nThen you may start your new display.",
    interpretation: { wealth: "Postpone big financial decisions; wait for clearer market signals.", career: "Do not start new projects for now; sort out old unfinished work first.", love: "Slow down the relationship pace; do not rush to make commitments.", health: "Guard against mood swings and digestive discomfort." },
    deityRecommendation: { deity: 'Wen Chang', deityId: 'wenchang' }
  },
  { id: 14, luck: 'Average Luck', luckLevel: 'average', luckColor: 'text-stone-500', luckBg: 'bg-stone-50', stickNo: 92,
    poem: "Small trivial troubles come and go,\nDo not let your mood sink low.\nGuard your mouth and calm your heart,\nPeace will stay inside your part.",
    interpretation: { wealth: "Beware of impulsive online shopping and unexpected small expenses.", career: "Avoid arguing with colleagues over trivial work details.", love: "Do not quarrel over small family chores.", health: "Stay away from crowded places to avoid minor infections." },
    deityRecommendation: { deity: 'Guan Yu', deityId: 'guanyu' }
  },
  { id: 15, luck: 'Average Luck', luckLevel: 'average', luckColor: 'text-stone-500', luckBg: 'bg-stone-50', stickNo: 99,
    poem: "Your fate stays in the waiting phase,\nNo big joy, no sudden haze.\nKeep your life simple and steady,\nBetter days will soon be ready.",
    interpretation: { wealth: "No new profit opportunities; just protect your existing savings.", career: "Maintain the status quo; do not take risky job changes.", love: "Singles need more time to meet the right person.", health: "Keep a regular daily routine." },
    deityRecommendation: { deity: 'Household Guardian', deityId: 'household' }
  },
  // Minor Caution (5)
  { id: 16, luck: 'Minor Caution', luckLevel: 'caution', luckColor: 'text-orange-500', luckBg: 'bg-orange-50', stickNo: 106,
    poem: "A cold wind blows across your way,\nPostpone big plans for today.\nStay indoors and guard your peace,\nLet the bad energy slowly cease.",
    interpretation: { wealth: "Strictly avoid high-risk investment and loans.", career: "Do not sign important agreements or submit critical applications.", love: "Avoid intense emotional arguments with your partner.", health: "Watch out for accidental bumps and colds." },
    deityRecommendation: { deity: 'God of Longevity', deityId: 'longevity' }
  },
  { id: 17, luck: 'Minor Caution', luckLevel: 'caution', luckColor: 'text-orange-500', luckBg: 'bg-orange-50', stickNo: 113,
    poem: "Trivial troubles begin to rise,\nGuard your words and calm your eyes.\nDo not take on new heavy tasks,\nLet the storm pass with relaxed masks.",
    interpretation: { wealth: "Beware of being cheated in small transactions.", career: "Refuse extra high-pressure new work temporarily.", love: "Keep emotional distance to avoid fierce quarrels.", health: "Reduce late nights and overwork." },
    deityRecommendation: { deity: 'Guan Yu', deityId: 'guanyu' }
  },
  { id: 18, luck: 'Minor Caution', luckLevel: 'caution', luckColor: 'text-orange-500', luckBg: 'bg-orange-50', stickNo: 120,
    poem: "Dark clouds gather above your door,\nSlow down every forward step more.\nHold tight to what you already gain,\nDo not chase profit through risky lane.",
    interpretation: { wealth: "No new business expansion; cut extra spending strictly.", career: "Put off job hopping and new project launches.", love: "Avoid forcing relationship progress; keep a low profile.", health: "Guard against stomach discomfort and sleep loss." },
    deityRecommendation: { deity: 'Household Guardian', deityId: 'household' }
  },
  { id: 19, luck: 'Minor Caution', luckLevel: 'caution', luckColor: 'text-orange-500', luckBg: 'bg-orange-50', stickNo: 127,
    poem: "Hasty actions bring regret fast,\nPause your steps and make it last.\nWait until the gloomy sky clears,\nThen you may chase your coming years.",
    interpretation: { wealth: "Reject all high-profit quick-money invitations.", career: "Do not make sudden career decisions on impulse.", love: "Do not make marriage or breakup choices on bad moods.", health: "Avoid outdoor activities with high accident risk." },
    deityRecommendation: { deity: 'Wen Chang', deityId: 'wenchang' }
  },
  { id: 20, luck: 'Minor Caution', luckLevel: 'caution', luckColor: 'text-orange-500', luckBg: 'bg-orange-50', stickNo: 134,
    poem: "Small misfortunes come one by one,\nKeep your mood warm under the sun.\nStay home and rest your tired mind,\nGood weather will soon be behind.",
    interpretation: { wealth: "Prevent property loss and unnecessary fines.", career: "Be careful with work documents to avoid minor mistakes.", love: "Reduce emotional entanglement and keep peace.", health: "Prevent seasonal illness and over-fatigue." },
    deityRecommendation: { deity: 'God of Longevity', deityId: 'longevity' }
  },
]

// Scroll decoration component
function ScrollDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating clouds/smoke */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-amber-100/30 to-orange-100/30 rounded-full blur-2xl animate-float"></div>
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-orange-100/20 to-amber-100/20 rounded-full blur-3xl animate-float-delayed"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-yellow-100/20 to-orange-100/20 rounded-full blur-2xl animate-float-slow"></div>
      
      {/* Temple pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c2410c' fill-opacity='1'%3E%3Cpath d='M40 0L0 40L40 80L80 40L40 0zM40 10L10 40L40 70L70 40L40 10z'/%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>
    </div>
  )
}

export default function PrayerPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null)
  const [isPraying, setIsPraying] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [prayerResult, setPrayerResult] = useState<string>('')
  const [recentPrayers, setRecentPrayers] = useState<any[]>([])
  const [totalPrayers, setTotalPrayers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [resultDeity, setResultDeity] = useState<any>(null)
  
  // Fortune Stick states
  const [showFortuneResult, setShowFortuneResult] = useState(false)
  const [currentFortune, setCurrentFortune] = useState<any>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [fortuneHistory, setFortuneHistory] = useState<any[]>([])
  const [todayFreeDraw, setTodayFreeDraw] = useState(true)
  const [showFortuneHistory, setShowFortuneHistory] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setPageError(null)
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          window.location.href = '/login'
          return
        }
        setUser(authUser)

        const userProfile = await getUserProfile(authUser.id)
        setProfile(userProfile)

        try {
          const { data: prayers } = await supabase
            .from('prayers')
            .select('*')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(50)
          
          setRecentPrayers(prayers || [])
          setTotalPrayers(prayers?.length || 0)
        } catch (prayerErr) {
          console.error('Prayer fetch exception:', prayerErr)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setPageError('Failed to load page. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const points = profile?.points || 0
  const selectedDeity = deities.find(d => d.id === selectedPrayer)

  // Draw fortune stick
  const drawFortune = async () => {
    if (!user) return
    
    const cost = 10
    
    // Check free draw eligibility
    if (todayFreeDraw) {
      // Free draw - deduct nothing
      const randomIndex = Math.floor(Math.random() * fortuneSticks.length)
      const fortune = fortuneSticks[randomIndex]
      setCurrentFortune(fortune)
      setIsDrawing(true)
      
      setTimeout(() => {
        setIsDrawing(false)
        setShowFortuneResult(true)
      }, 1500)
      
      // Save to history
      const newEntry = { ...fortune, drawnAt: new Date().toISOString(), isFree: true }
      setFortuneHistory(prev => [newEntry, ...prev].slice(0, 20))
      setTodayFreeDraw(false)
    } else if (points >= cost) {
      // Paid draw
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: points - cost })
        .eq('id', user.id)
        .select()
      
      if (updateError) {
        alert('Failed to deduct points: ' + updateError.message)
        return
      }
      
      setProfile((prev: any) => ({ ...prev, points: points - cost }))
      
      const randomIndex = Math.floor(Math.random() * fortuneSticks.length)
      const fortune = fortuneSticks[randomIndex]
      setCurrentFortune(fortune)
      setIsDrawing(true)
      
      setTimeout(() => {
        setIsDrawing(false)
        setShowFortuneResult(true)
      }, 1500)
      
      // Save to history and record transaction
      const newEntry = { ...fortune, drawnAt: new Date().toISOString(), isFree: false }
      setFortuneHistory(prev => [newEntry, ...prev].slice(0, 20))
      
      try {
        await supabase.from('point_transactions').insert({
          user_id: user.id,
          description: 'Fortune Stick Draw',
          points: -cost
        })
      } catch (e) {
        console.warn('Transaction failed:', e)
      }
    } else {
      alert('Not enough merit points for extra draw')
    }
  }

  // Scroll to deity section
  const scrollToDeity = (deityId: string) => {
    setSelectedPrayer(deityId)
    setShowFortuneResult(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const performPrayer = async () => {
    if (!selectedPrayer || !user) return

    const deity = deities.find(d => d.id === selectedPrayer)
    if (!deity) return

    if (points < deity.cost) {
      alert('Not enough merit points')
      return
    }

    setIsPraying(true)

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: points - deity.cost })
        .eq('id', user.id)
        .select()

      if (updateError) {
        alert('Failed to deduct points: ' + updateError.message)
        return
      }

      try {
        await supabase.from('prayers').insert({
          user_id: user.id,
          prayer_type: deity.name,
          points_spent: deity.cost,
        })
      } catch (e) {
        console.warn('Prayer insert failed (non-critical):', e)
      }

      try {
        await supabase.from('point_transactions').insert({
          user_id: user.id,
          description: `Worship to ${deity.name}`,
          points: -deity.cost
        })
      } catch (e) {
        console.warn('Transaction failed (non-critical):', e)
      }

      setResultDeity(deity)
      setShowResult(true)

      try {
        const updatedProfile = await getUserProfile(user.id)
        if (updatedProfile) setProfile(updatedProfile)
      } catch (e) {
        setProfile((prev: any) => ({ ...prev, points: points - deity.cost }))
      }

      try {
        const { data: prayers } = await supabase
          .from('prayers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
        if (prayers) {
          setRecentPrayers(prayers)
          setTotalPrayers(prayers.length)
        }
      } catch (e) {
        setTotalPrayers(prev => prev + 1)
      }
      
    } catch (error: any) {
      console.error('Error performing prayer:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsPraying(false)
    }
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Flame className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-stone-700">Entering the Temple...</h2>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  if (pageError) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😔</span>
            </div>
            <h2 className="text-xl font-semibold text-stone-700 mb-2">Something went wrong</h2>
            <p className="text-stone-500 mb-4">{pageError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-5xl mx-auto">

          {/* Success Result */}
          {showResult && resultDeity && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full relative overflow-hidden">
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"></div>
                
                {/* Deity image with divine glow animation */}
                <div className="relative mx-auto mb-6">
                  {/* Outer glow rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full bg-gradient-to-br from-amber-200/50 to-orange-200/50 animate-ping" style={{ animationDuration: '2s' }}></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-300/40 to-yellow-300/40 animate-pulse"></div>
                  </div>
                  
                  {/* Rotating sparkles */}
                  <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '8s' }}>
                    <div className="w-40 h-40 relative">
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 text-yellow-400 text-xl">✨</span>
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-amber-400 text-xl">✨</span>
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-orange-400 text-xl">✨</span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-yellow-400 text-xl">✨</span>
                    </div>
                  </div>
                  
                  {/* Deity image */}
                  <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-amber-300 shadow-2xl">
                    <img 
                      src={resultDeity.image} 
                      alt={resultDeity.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const fallback = target.parentElement?.querySelector('.deity-fallback') as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                    <div className="deity-fallback absolute inset-0 items-center justify-center text-5xl bg-gradient-to-br from-amber-100 to-orange-100">
                      {resultDeity.emoji}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent pointer-events-none"></div>
                  </div>
                  
                  {/* Floating blessing particles */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <div className="relative">
                      <span className="absolute text-2xl animate-bounce" style={{ animationDelay: '0s', left: '-20px' }}>🌟</span>
                      <span className="absolute text-xl animate-bounce" style={{ animationDelay: '0.3s', left: '10px' }}>💫</span>
                      <span className="absolute text-2xl animate-bounce" style={{ animationDelay: '0.6s', left: '40px' }}>✨</span>
                    </div>
                  </div>
                </div>
                
                {/* Deity receives prayer animation text */}
                <div className="mb-4">
                  <p className="text-amber-600 text-sm font-medium animate-pulse mb-1">
                    🙏 {resultDeity.deity} has received your worship 🙏
                  </p>
                </div>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                  Worship Successfully Offered
                </div>
                
                <h2 className="text-2xl font-bold text-stone-800 mb-3">
                  {resultDeity.name}
                </h2>
                
                <p className="text-stone-600 leading-relaxed mb-6">
                  Your devout worship has been received by {resultDeity.deity}. Stay positive, and your wish will soon be blessed.
                </p>
                
                <div className="flex items-center justify-center gap-2 text-amber-600 font-semibold mb-6">
                  <Coins className="w-5 h-5" />
                  <span>Remaining: {profile?.points || 0} coins</span>
                </div>
                
                <button
                  onClick={() => {
                    setShowResult(false)
                    setSelectedPrayer(null)
                    setResultDeity(null)
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Return to Temple
                </button>
              </div>
            </div>
          )}

          {/* Fortune Stick Result Modal */}
          {showFortuneResult && currentFortune && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className={`bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden ${currentFortune.luckBg}`}>
                {/* Decorative border */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"></div>
                
                {/* Fortune Header */}
                <div className="text-center mb-6">
                  <p className="text-amber-600 text-sm font-medium mb-2 animate-pulse">
                    🙏 Your fortune has been drawn 🙏
                  </p>
                  <div className={`text-3xl font-bold ${currentFortune.luckColor} mb-1`}>
                    Fortune Stick No. {currentFortune.stickNo}
                  </div>
                  <div className={`inline-block px-4 py-1 rounded-full ${currentFortune.luckBg} border ${currentFortune.luckLevel === 'great' ? 'border-yellow-300' : currentFortune.luckLevel === 'good' ? 'border-emerald-300' : currentFortune.luckLevel === 'average' ? 'border-stone-300' : 'border-orange-300'}`}>
                    <span className={`font-bold ${currentFortune.luckColor}`}>{currentFortune.luck}</span>
                  </div>
                </div>

                {/* Fortune Poem */}
                <div className="bg-white/80 rounded-xl p-4 mb-4 border border-stone-200">
                  <p className="text-center text-stone-700 italic leading-relaxed">
                    {currentFortune.poem}
                  </p>
                </div>

                {/* Interpretation */}
                <div className="bg-white/60 rounded-xl p-4 mb-4 space-y-2">
                  <p className="text-xs text-stone-500 font-medium mb-2">Interpretation:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500">💰</span>
                      <span className="text-stone-600">{currentFortune.interpretation.wealth}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500">💼</span>
                      <span className="text-stone-600">{currentFortune.interpretation.career}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-pink-500">❤️</span>
                      <span className="text-stone-600">{currentFortune.interpretation.love}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500">🏥</span>
                      <span className="text-stone-600">{currentFortune.interpretation.health}</span>
                    </div>
                  </div>
                </div>

                {/* Deity Recommendation */}
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-4 mb-6 border border-amber-200">
                  <p className="text-xs text-stone-500 font-medium mb-2">Deity Recommendation:</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const recDeity = deities.find(d => d.id === currentFortune.deityRecommendation.deityId)
                        return recDeity ? (
                          <>
                            <span className="text-2xl">{recDeity.emoji}</span>
                            <span className="font-semibold text-stone-700">{currentFortune.deityRecommendation.deity}</span>
                          </>
                        ) : null
                      })()}
                    </div>
                    <button
                      onClick={() => scrollToDeity(currentFortune.deityRecommendation.deityId)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-full hover:shadow-lg transition-all"
                    >
                      Offer Worship
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowFortuneResult(false)}
                  className="w-full py-3 bg-stone-200 text-stone-700 font-semibold rounded-full hover:bg-stone-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Main Temple Card */}
          <div className="relative bg-gradient-to-b from-stone-100 via-amber-50/50 to-orange-50/30 rounded-3xl shadow-2xl border border-amber-200/50 overflow-hidden">
            <ScrollDecoration />
            
            {/* Temple Roof Header */}
            <div className="relative bg-gradient-to-b from-amber-700 via-amber-600 to-orange-700 px-8 py-10 text-center overflow-hidden">
              {/* Roof pattern */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 22px)`,
              }}></div>
              
              {/* Floating flames */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-amber-900/20 to-transparent"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <Flame className="w-8 h-8 text-amber-200 animate-pulse" />
                  <Flame className="w-10 h-10 text-amber-300 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <Flame className="w-8 h-8 text-amber-200 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">
                  Temple of Chinese Deities
                </h1>
                
                <p className="text-amber-100/80 text-sm md:text-base">
                  Offer devout worship to the right god, and receive targeted divine blessings for your wishes.
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 p-6 md:p-8">
              
              {/* Stats Bar - Temple Pillars Style */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Coins, label: 'My Merit Coins', sublabel: 'Balance available for worship rituals', value: points.toLocaleString(), color: 'amber', bg: 'from-amber-100 to-orange-100' },
                  { icon: Flame, label: 'Total Worships', sublabel: 'Times you have prayed in the temple', value: totalPrayers, color: 'orange', bg: 'from-orange-100 to-red-100' },
                  { icon: Star, label: 'Blessings Granted', sublabel: 'Record of fulfilled prayers', value: '∞', color: 'pink', bg: 'from-pink-100 to-rose-100' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-4 text-center border border-${stat.color}-200 shadow-lg`}>
                    <stat.icon className={`w-6 h-6 mx-auto mb-2 text-${stat.color}-500`} />
                    <p className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</p>
                    <p className="text-xs text-stone-600 mt-1 font-medium">{stat.label}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Deity Selection */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sun className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-800">Choose Your Deity for Your Wish</h2>
                    <p className="text-sm text-stone-500">Pick the god who rules over what you want to manifest.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {deities.map((deity) => (
                    <button
                      key={deity.id}
                      onClick={() => setSelectedPrayer(deity.id)}
                      className={`relative p-5 rounded-2xl border-2 transition-all text-left group hover:-translate-y-1 ${
                        selectedPrayer === deity.id
                          ? `${deity.borderColor} ${deity.bgColor} shadow-xl`
                          : 'border-stone-200 bg-white hover:border-amber-200 hover:shadow-lg'
                      }`}
                    >
                      {/* Selected indicator */}
                      {selectedPrayer === deity.id && (
                        <div className={`absolute -top-2 -right-2 w-8 h-8 ${deity.iconBg} rounded-full flex items-center justify-center shadow-lg`}>
                          <Star className="w-4 h-4 text-white fill-white" />
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div className={`relative w-16 h-16 ${deity.bgColor} rounded-xl flex items-center justify-center text-3xl transition-transform overflow-hidden border-2 ${deity.borderColor} ${
                          selectedPrayer === deity.id ? 'scale-110 rotate-3' : 'group-hover:scale-105'
                        }`}>
                          <img 
                            src={deity.image} 
                            alt={deity.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const fallback = target.parentElement?.querySelector('.deity-fallback') as HTMLElement
                              if (fallback) fallback.style.display = 'flex'
                            }}
                          />
                          <div className="deity-fallback absolute inset-0 items-center justify-center text-3xl">
                            {deity.emoji}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-stone-800 text-lg">{deity.name}</h3>
                            {deity.subtitle && (
                              <span className={`text-xs ${deity.colorName} font-medium bg-white/60 px-2 py-0.5 rounded-full`}>
                                {deity.subtitle}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${deity.colorName} font-semibold mb-2`}>✨ {deity.blessing}</p>
                          <p className="text-sm text-stone-500 mb-3 line-clamp-2">{deity.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-amber-600 font-bold">
                              <Coins className="w-4 h-4" />
                              <span>{deity.cost} coins</span>
                            </div>
                            {selectedPrayer === deity.id && (
                              <span className="text-xs text-emerald-600 font-medium">Selected</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Blessing domains preview */}
                      {selectedPrayer === deity.id && (
                        <div className="mt-4 pt-4 border-t border-stone-200">
                          <p className="text-xs text-stone-500 mb-2 font-medium">What {deity.deity} protects:</p>
                          <div className="flex flex-wrap gap-2">
                            {deity.domains.map((domain, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-white rounded-full text-stone-600 border border-stone-200">
                                ✨ {domain}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Deity Details & Action */}
              {selectedDeity && (
                <div className={`mb-8 p-6 rounded-2xl bg-gradient-to-br ${selectedDeity.bgColor} border-2 ${selectedDeity.borderColor} relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`relative w-20 h-20 rounded-2xl overflow-hidden border-4 ${selectedDeity.borderColor} shadow-lg`}>
                        <img 
                          src={selectedDeity.image} 
                          alt={selectedDeity.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const fallback = target.parentElement?.querySelector('.deity-fallback') as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                        <div className={`deity-fallback absolute inset-0 items-center justify-center text-4xl ${selectedDeity.bgColor}`}>
                          {selectedDeity.emoji}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-stone-800">Your Worship Ritual to {selectedDeity.name}</h3>
                        <p className={`text-sm ${selectedDeity.colorName} font-medium`}>Goal: {selectedDeity.blessing}</p>
                      </div>
                    </div>
                    
                    {/* Prayer Text */}
                    <div className="bg-white/60 rounded-xl p-4 mb-4 border border-white/80">
                      <p className="text-xs text-stone-500 mb-2 font-medium flex items-center gap-1">
                        <Scroll className="w-3 h-3" />
                        Your Prayer
                      </p>
                      <p className="text-stone-700 leading-relaxed italic">
                        &ldquo;{selectedDeity.prayerText}&rdquo;
                      </p>
                    </div>

                    {/* Prayer Effect */}
                    <div className="flex items-center gap-2 text-sm text-stone-600 mb-4 bg-white/40 rounded-xl p-3">
                      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <p><strong>Prayer Effect:</strong> {selectedDeity.prayerEffect}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Offer your sincere prayer for best results</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {selectedDeity ? (
                points >= selectedDeity.cost ? (
                  <button
                    onClick={performPrayer}
                    disabled={isPraying}
                    className={`w-full py-4 bg-gradient-to-r ${selectedDeity.color} text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden group`}
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700"></span>
                    {isPraying ? (
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Offering Your Worship...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3 relative z-10">
                        <Flame className="w-6 h-6" />
                        Offer Worship Now
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-200">
                    <p className="text-red-600 font-semibold mb-3">
                      Need {selectedDeity.cost - points} more coins for this worship
                    </p>
                    <Link
                      href="/user/points"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full hover:shadow-lg transition-all"
                    >
                      <TrendingUp className="w-5 h-5" />
                      Earn Free Coins
                    </Link>
                  </div>
                )
              ) : (
                <div className="text-center p-6 bg-stone-100 rounded-2xl">
                  <p className="text-stone-500">Select a deity above to begin your worship</p>
                </div>
              )}

              {/* Daily Fortune Stick Draw Section */}
              <div className="mt-8 pt-8 border-t-2 border-dashed border-amber-200">
                <div className="bg-gradient-to-b from-amber-50 via-orange-50/50 to-yellow-50/30 rounded-2xl border-2 border-amber-200/60 p-6 shadow-lg">
                  
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🎋</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-stone-800">Daily Fortune Stick Draw</h2>
                      <p className="text-sm text-stone-500">Receive divine guidance after your worship.</p>
                    </div>
                  </div>

                  {/* Free draw info */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-emerald-700 font-medium">
                        {todayFreeDraw ? '1 Free Draw Available Today' : 'Extra Draw: 10 Merit Coins'}
                      </span>
                    </div>
                  </div>

                  {/* Shake animation container */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={drawFortune}
                      disabled={isDrawing}
                      className={`relative w-32 h-32 rounded-full bg-gradient-to-b from-amber-200 via-orange-200 to-amber-300 shadow-2xl flex items-center justify-center transition-all ${isDrawing ? 'animate-bounce' : 'hover:scale-105 active:scale-95'} ${!todayFreeDraw && points < 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {/* Stick tube visual */}
                      <div className="flex flex-col items-center">
                        <span className="text-5xl mb-1">🎋</span>
                        <span className="text-xs text-amber-700 font-bold">SHAKE</span>
                      </div>
                      
                      {/* Shake animation overlay */}
                      {isDrawing && (
                        <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping"></div>
                      )}
                    </button>
                    
                    <p className="text-sm text-stone-500 mt-3 text-center max-w-xs">
                      {isDrawing ? 'The deity is selecting your fortune...' : 'Tap to shake the stick tube'}
                    </p>
                  </div>
                </div>

                {/* Past Fortune Sticks - Collapsible */}
                {fortuneHistory.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowFortuneHistory(!showFortuneHistory)}
                      className="w-full flex items-center justify-between p-4 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Scroll className="w-5 h-5 text-stone-500" />
                        <span className="font-semibold text-stone-700">Past Fortune Sticks ({fortuneHistory.length})</span>
                      </div>
                      <span className={`transform transition-transform ${showFortuneHistory ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    
                    {showFortuneHistory && (
                      <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                        {fortuneHistory.map((fortune: any, index: number) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-xl border ${fortune.luckLevel === 'great' ? 'bg-yellow-50 border-yellow-200' : fortune.luckLevel === 'good' ? 'bg-emerald-50 border-emerald-200' : fortune.luckLevel === 'average' ? 'bg-stone-50 border-stone-200' : 'bg-orange-50 border-orange-200'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${fortune.luckColor}`}>No.{fortune.stickNo}</span>
                                <span className={`text-sm font-medium ${fortune.luckColor}`}>{fortune.luck}</span>
                              </div>
                              <span className="text-xs text-stone-400">
                                {new Date(fortune.drawnAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prayer History - Scroll Style */}
          {recentPrayers.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-stone-300 to-stone-400 rounded-xl flex items-center justify-center shadow-lg">
                  <Scroll className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-800">Your Worship History</h2>
                  <p className="text-sm text-stone-500">Every devout prayer is archived in the temple.</p>
                </div>
              </div>

              <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 shadow-lg">
                <div className="space-y-3">
                  {recentPrayers.map((prayer: any, index: number) => {
                    const matchedDeity = deities.find(d => 
                      d.name === prayer.prayer_type || 
                      d.deity === prayer.prayer_type ||
                      prayer.prayer_type?.includes(d.name) ||
                      prayer.prayer_type?.includes(d.deity)
                    )
                    const displayEmoji = matchedDeity?.emoji || '🙏'
                    const displayName = prayer.prayer_type
                    
                    return (
                      <div 
                        key={prayer.id} 
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-amber-200 bg-gradient-to-br from-amber-100 to-orange-100">
                          {matchedDeity ? (
                            <img 
                              src={matchedDeity.image} 
                              alt={prayer.prayer_type}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const fallback = target.parentElement?.querySelector('.deity-fallback') as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className={`deity-fallback absolute inset-0 items-center justify-center text-2xl ${matchedDeity ? '' : 'flex'}`}>
                            {displayEmoji}
                          </div>
                        </div>
                          <div>
                            <p className="font-semibold text-stone-800">{displayName}</p>
                            <p className="text-xs text-stone-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(prayer.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-600">-{prayer.points_spent} coins</p>
                          <p className="text-xs text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Blessing Recorded
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <p className="text-xs text-stone-400 mt-4 text-center italic">
                  * All worships are sealed in the temple archive and granted with divine sincerity. *
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {recentPrayers.length === 0 && !loading && (
            <div className="mt-8 text-center py-12 bg-gradient-to-b from-stone-100 to-stone-50 rounded-2xl border border-stone-200">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-700 mb-2">Your Worship Scroll is Empty</h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto">
                Begin your spiritual journey by offering your first worship above. The temple awaits your sincere devotion.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-float-slow {
          animation: float 10s ease-in-out infinite;
          animation-delay: 4s;
        }
      `}</style>
    </SidebarLayout>
  )
}
