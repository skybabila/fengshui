'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { Sparkles, ArrowRight, RefreshCw, Star, BookOpen, Heart, Sun, Moon, Cloud, Zap } from 'lucide-react'

const FORTUNES = [
  { title: "Rising Sun", content: "Your efforts are beginning to show results. The morning sun brings new opportunities. Embrace the warmth of progress and step forward with confidence.", type: "Excellent" },
  { title: "Flowing Water", content: "Flexibility is your strength today. Like water finding its path, you will overcome obstacles with grace. Let things flow naturally.", type: "Good" },
  { title: "Mountain Peak", content: "A time of achievement awaits. You have climbed steadily and now stand at a vantage point. Take in the view and plan your next move.", type: "Excellent" },
  { title: "Gentle Breeze", content: "Peace surrounds you today. A gentle breeze carries positive energy. Enjoy the calm and let go of tension.", type: "Good" },
  { title: "Golden Path", content: "Success illuminates your path. Follow the golden light and trust your instincts. Great achievements are within reach.", type: "Excellent" },
  { title: "Ancient Wisdom", content: "Knowledge seeks you today. An old saying or lesson resurfaces. Reflect on past experiences for present guidance.", type: "Good" },
  { title: "Blooming Garden", content: "Your efforts are bearing fruit. Like flowers in spring, good things are blossoming around you. Nurture what is growing.", type: "Excellent" },
  { title: "Quiet Reflection", content: "A peaceful day for inner thought. Step back from the noise and listen to your inner voice. Clarity comes from stillness.", type: "Normal" },
  { title: "New Horizons", content: "Boundaries are expanding. New possibilities appear on the horizon. Be brave and explore the unknown.", type: "Good" },
  { title: "Patient Heart", content: "Waiting has value. Not everything unfolds on our timeline. Trust the timing of life.", type: "Normal" },
  { title: "Dancing Flames", content: "Passion ignites within you. Creative energy surges. Channel this fire into meaningful work.", type: "Good" },
  { title: "Starlit Night", content: "Dreams carry significance tonight. Pay attention to subtle messages. The universe speaks in whispers.", type: "Good" },
  { title: "Steady Steps", content: "Progress comes through consistency. Each small step matters. Keep walking your chosen path.", type: "Good" },
  { title: "Open Gate", content: "An opportunity is unlocked. A door you thought closed may have opened. Be alert to new chances.", type: "Excellent" },
  { title: "Harmonious Day", content: "Balance is your gift today. Relationships flow smoothly. Share your positive energy with others.", type: "Good" },
  { title: "Morning Dew", content: "Fresh beginnings await. Each day brings new potential. Approach today with wonder.", type: "Normal" },
  { title: "Warm Embrace", content: "Love and support surround you. Someone cares deeply for your wellbeing. Accept help graciously.", type: "Good" },
  { title: "Crossroads", content: "An important choice lies ahead. Consider your values carefully. The path you choose shapes tomorrow.", type: "Challenging" },
  { title: "Silver Lining", content: "Even clouds have a bright side. Look for the positive in situations. Growth often hides in challenges.", type: "Good" },
  { title: "Inner Strength", content: "You possess more resilience than you realize. Difficult times reveal your true power. Trust yourself.", type: "Good" },
  { title: "Hidden Treasure", content: "Something valuable awaits discovery. Look beyond the obvious. The best gifts come unexpectedly.", type: "Excellent" },
  { title: "Peaceful River", content: "Calm waters ahead. A period of peace is approaching. Use this time wisely for reflection.", type: "Normal" },
  { title: "Bright Idea", content: "A flash of insight arrives. Trust your intuition. Your creativity is at its peak.", type: "Excellent" },
  { title: "Harvest Season", content: "Time to reap what you have sown. Your hard work pays dividends. Celebrate your achievements.", type: "Excellent" },
  { title: "Dawn's Light", content: "A new chapter begins. The early light brings hope. Embrace fresh starts with courage.", type: "Good" },
  { title: "Traveler's Path", content: "Movement and change are favored. A journey awaits, whether physical or spiritual. Welcome the adventure.", type: "Good" },
  { title: "Family Circle", content: "Home and family take center stage. Strengthen bonds with loved ones. Togetherness brings joy.", type: "Good" },
  { title: "Friendship Bridge", content: "Loyal friends are your treasure. Reach out to those who support you. Reciprocate kindness.", type: "Good" },
  { title: "Wealth River", content: "Financial opportunities flow your way. Money energy is favorable. Make wise spending decisions.", type: "Excellent" },
  { title: "Career Ascent", content: "Professional growth accelerates. Your skills are recognized. Seize advancement opportunities.", type: "Excellent" },
  { title: "Creative Spirit", content: "Artistic energy surges within. Express yourself through creative outlets. Beauty needs to be shared.", type: "Good" },
  { title: "Healing Hands", content: "A time of restoration approaches. Physical or emotional healing is favored. Be gentle with yourself.", type: "Normal" },
  { title: "Eagle's Eye", content: "Clarity of vision is yours. See the bigger picture clearly. Wisdom guides your decisions.", type: "Excellent" },
  { title: "Phoenix Rising", content: "Rebirth from challenges. You emerge stronger from trials. What was broken becomes beautiful.", type: "Excellent" },
  { title: "Sacred Ground", content: "A sacred moment approaches. Life feels more meaningful. Honor the spiritual in daily life.", type: "Good" },
  { title: "Morning Mist", content: "Some uncertainty lingers. Not everything is as it appears. Look deeper before acting.", type: "Normal" },
  { title: "Warm Hearth", content: "Comfort and coziness surround you. Home is where the heart finds peace. Enjoy simple pleasures.", type: "Good" },
  { title: "Brave Heart", content: "Courage rises within you. Face your fears head-on. Bravery brings rewards.", type: "Good" },
  { title: "Setting Sun", content: "A phase comes to a close. Endings bring new beginnings. Let go gracefully.", type: "Normal" },
  { title: "Promise Kept", content: "Your word has power. Be true to your commitments. Integrity opens doors.", type: "Good" },
  { title: "Laughing Stream", content: "Joy bubbles up naturally. Happiness flows to you. Share laughter with others.", type: "Good" },
  { title: "Guardian Angel", content: "Protection surrounds you. A guiding presence watches over your path. Trust the protection.", type: "Good" },
  { title: "Ancient Tree", content: "Deep roots give you strength. Draw energy from your foundations. You are grounded.", type: "Normal" },
  { title: "Diamond Light", content: "Inner brilliance shines through. Your true nature radiates. Be authentically yourself.", type: "Excellent" },
  { title: "Falling Leaf", content: "Release what no longer serves. Let go with grace. Surrender brings freedom.", type: "Normal" },
  { title: "Crystal Clear", content: "Truth emerges from confusion. See situations with perfect clarity. Honesty benefits you.", type: "Good" },
  { title: "Lotus Bloom", content: "Beauty emerges from muddy waters. You transform through challenges. Purity rises above.", type: "Excellent" },
  { title: "Wind's Whisper", content: "Messages arrive on the wind. Pay attention to signs. The world speaks to those who listen.", type: "Good" },
  { title: "Sacred Fire", content: "Spiritual energy intensifies. Deep transformation is occurring. Honor your inner light.", type: "Good" },
  { title: "Ocean's Breath", content: "Deep emotions flow like tides. Honor your feelings. Emotional depth is your strength.", type: "Normal" },
  { title: "Golden Heart", content: "Generosity returns to you. What you give comes back multiplied. Share your blessings.", type: "Excellent" },
  { title: "Mountain Spring", content: "Pure and refreshing energy flows. New ideas spring forth. Clean thinking brings clarity.", type: "Good" },
  { title: "Thunder's Voice", content: "A powerful message arrives. Wake up call demands attention. Change is necessary.", type: "Challenging" },
  { title: "Rainbow's End", content: "After the storm comes color. Promise of better times ahead. Hope illuminates the path.", type: "Excellent" },
  { title: "Earth's Embrace", content: "Ground yourself in stability. Nature provides comfort. Spend time outdoors.", type: "Normal" },
  { title: "Butterfly Wings", content: "Transformation takes flight. Change brings freedom. Embrace your evolution.", type: "Good" },
  { title: "Ancient Scroll", content: "Hidden knowledge is revealed. Study or teaching is favored. Wisdom seeks you.", type: "Good" },
  { title: "Drumbeat Heart", content: "Rhythm moves your spirit. Dance or movement heals. Let your body express.", type: "Good" },
  { title: "Candle Glow", content: "Warm light in darkness. Hope flickers but burns bright. Small flames illuminate.", type: "Normal" },
  { title: "Twins Walking", content: "Balance of opposites. Duality presents choices. Integrate opposing forces.", type: "Challenging" },
  { title: "Seed Planted", content: "New beginnings take root. What you plant now grows later. Choose seeds wisely.", type: "Good" },
  { title: "Honey Sweet", content: "Life tastes sweeter now. Enjoy pleasant moments. Success feels delicious.", type: "Excellent" },
  { title: "Sword Truth", content: "Cut through deception with truth. Sharp words bring clarity. Speak your truth.", type: "Good" },
  { title: "Silent Night", content: "Peaceful solitude recharges you. Quiet time restores spirit. Embrace stillness.", type: "Normal" },
  { title: "Lion's Roar", content: "Inner power awakens. You command respect naturally. Step into your authority.", type: "Excellent" },
  { title: "Moon's Mirror", content: "Intuition reflects truth. Look within for answers. The moon reveals hidden things.", type: "Good" },
  { title: "Silk Road", content: "Prosperity travels to you. Wealth and abundance flow. Open doors to receive.", type: "Excellent" },
  { title: "Pine Strength", content: "Evergreen resilience. Difficult conditions don't diminish you. Endure with grace.", type: "Good" },
  { title: "Wind Chimes", content: "Messages from spirit. Pay attention to sounds. Synchronicities increase.", type: "Good" },
  { title: "Mirror Pool", content: "Reflection brings self-knowledge. See yourself clearly. Inner work pays dividends.", type: "Normal" },
  { title: "Red String", content: "Fate connects you to others. Important relationships are highlighted. Love destiny unfolds.", type: "Excellent" },
  { title: "Storm's Eye", content: "Calm in the center of chaos. You remain centered amid turmoil. Peace within, not without.", type: "Good" },
  { title: "Morning Bird", content: "Early signs appear. News arrives at dawn. Watch for morning messages.", type: "Good" },
  { title: "Iron Will", content: "Determination overcomes obstacles. Nothing stands between you and your goal. Persist.", type: "Good" },
  { title: "Willow Grace", content: "Flexibility弯曲 not breaking. Yielding overcomes rigid resistance. Adapt with elegance.", type: "Good" },
  { title: "Tiger's Courage", content: "Bold action is favored. Face challenges with fierce courage. Win by courage.", type: "Excellent" },
  { title: "Jade Stone", content: "Inner value shines. You are treasured more than you know. See your own worth.", type: "Good" },
  { title: "Night Sky", content: "Infinite possibilities above. Dream big without limits. Stars invite your ambition.", type: "Excellent" },
  { title: "Feather Light", content: "Heavy burdens lift away. What troubled you fades. Feel lighter and freer.", type: "Good" },
  { title: "Dragon's Breath", content: "Powerful energy rises. Creative fire transforms. Breathe new life into projects.", type: "Excellent" },
  { title: "Honeycomb", content: "Sweet rewards for patient work. Your diligence is rewarded. Enjoy the fruits.", type: "Good" },
  { title: "Stone Path", content: "A steady, reliable path emerges. Work steadily toward goals. No shortcuts, but sure progress.", type: "Normal" },
  { title: "Flower Offering", content: "Give gifts freely. Generosity attracts abundance. What you offer returns.", type: "Good" },
  { title: "Mountain Temple", content: "Seek higher wisdom. Spiritual insight is near. Visit quiet places for answers.", type: "Good" },
  { title: "Shooting Star", content: "Make a wish now. A fleeting moment of magic. Dreams can come true.", type: "Excellent" },
  { title: "River's Bend", content: "Life turns a corner. Unexpected changes redirect you. New direction brings growth.", type: "Normal" },
  { title: "Sunrise Gold", content: "Golden opportunities at dawn. Early action brings advantage. Rise and seize the day.", type: "Excellent" },
  { title: "Dove Peace", content: "Harmony descends. Conflicts resolve peacefully. Forgiveness brings closure.", type: "Good" },
  { title: "Clock's Hand", content: "Time moves in your favor. Right timing is everything. Wait for your moment.", type: "Normal" },
  { title: "Chestnut Fire", content: "Warmth and comfort within. Home gatherings bring joy. Hearts connect deeply.", type: "Good" },
  { title: "White Crane", content: "Elegance in movement. Grace carries you through. Poise attracts admiration.", type: "Good" },
  { title: "Thunder Cloud", content: "Pressure builds before release. Tension precedes breakthrough. Don't give up yet.", type: "Challenging" },
  { title: "Cedar Tree", content: "Noble and strong standing. You have integrity others admire. Stand tall.", type: "Good" },
  { title: "Well Water", content: "Deep wisdom from within. Draw from your inner resources. Self-trust grows.", type: "Normal" },
  { title: "Apple's Gift", content: "Knowledge is the greatest treasure. Learning opens doors. Read, study, grow.", type: "Good" },
  { title: "Crown Jewel", content: "Royal success is yours. Achievement crowns your efforts. You are a winner.", type: "Excellent" },
  { title: "Dewdrop", content: "Simple beauty in small things. Find joy in modest pleasures. Less is more.", type: "Normal" },
  { title: "Forge Fire", content: "Transform through trials. Heat of challenges forges strength. You become stronger.", type: "Good" },
]

const fortuneTypeConfig: Record<string, { emoji: string; color: string; bgColor: string }> = {
  Excellent: { emoji: '🌟', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-100' },
  Good: { emoji: '✨', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-100' },
  Normal: { emoji: '🌤️', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-100' },
  Challenging: { emoji: '⛅', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-100' },
}

export default function FortuneDrawPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [drawing, setDrawing] = useState(false)
  const [drawnFortune, setDrawnFortune] = useState<any>(null)
  const [luckyNumber, setLuckyNumber] = useState<number>(0)
  const [animationClass, setAnimationClass] = useState('')

  const getLuckyNumber = (type: string): number => {
    switch (type) {
      case 'Excellent': return Math.floor(Math.random() * 15) + 85 // 85-99
      case 'Good': return Math.floor(Math.random() * 25) + 60 // 60-84
      case 'Normal': return Math.floor(Math.random() * 20) + 40 // 40-59
      case 'Challenging': return Math.floor(Math.random() * 20) + 20 // 20-39
      default: return Math.floor(Math.random() * 80) + 20
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
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

  const handleDraw = async () => {
    setDrawing(true)
    setAnimationClass('animate-shake')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const randomIndex = Math.floor(Math.random() * FORTUNES.length)
    const selectedFortune = FORTUNES[randomIndex]
    const number = getLuckyNumber(selectedFortune.type)
    
    setDrawnFortune(selectedFortune)
    setLuckyNumber(number)
    setAnimationClass('animate-fade-in-up')
    setDrawing(false)
  }

  const handleReset = () => {
    setDrawnFortune(null)
    setAnimationClass('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-2xl">🎋</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
        </div>
      </div>
    )
  }

  const config = drawnFortune ? fortuneTypeConfig[drawnFortune.type] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Fortune Stick Drawing</h1>
          <p className="text-stone-500">Draw your daily fortune from the ancient wisdom</p>
        </div>

        {!drawnFortune ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
            <div className="mb-8">
              <div 
                className={`w-32 h-40 bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg mx-auto flex items-center justify-center shadow-2xl cursor-pointer hover:scale-105 transition-transform ${drawing ? 'animate-bounce' : ''}`}
                onClick={!drawing ? handleDraw : undefined}
              >
                <div className="text-center text-amber-100">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-80" />
                  <span className="text-sm font-medium">Tap to Draw</span>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-2 text-amber-600">
                <Star className="w-4 h-4" />
                <Star className="w-4 h-4" />
                <Star className="w-4 h-4" />
                <Star className="w-4 h-4" />
                <Star className="w-4 h-4" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Fortune Stick</h2>
            <p className="text-stone-500 mb-8 max-w-md mx-auto">
              Ancient tradition meets modern wisdom. Click the fortune stick container to receive your daily guidance. 
              Each draw reveals a unique message tailored for your day.
            </p>

            <button
              onClick={handleDraw}
              disabled={drawing}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 transition-all hover:-translate-y-1 disabled:opacity-50"
            >
              {drawing ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Drawing Fortune...
                </span>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  Draw Your Fortune
                </>
              )}
            </button>

            {!user && (
              <p className="mt-4 text-sm text-stone-400">
                <a href="/login" className="text-emerald-600 hover:underline">Sign in</a> to track your fortune history
              </p>
            )}
          </div>
        ) : (
          <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${animationClass}`}>
            <div className={`bg-gradient-to-r ${config?.color} p-8 text-center text-white relative`}>
              <div className="absolute top-4 right-4">
                <button 
                  onClick={handleReset}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <div className="text-6xl mb-4">{config?.emoji}</div>
              <h2 className="text-2xl font-bold mb-2">{drawnFortune.title}</h2>
              <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full ${config?.bgColor} text-sm font-medium ${drawnFortune.type === 'Excellent' ? 'text-green-700' : drawnFortune.type === 'Good' ? 'text-emerald-700' : drawnFortune.type === 'Normal' ? 'text-amber-700' : 'text-orange-700'}`}>
                {drawnFortune.type} Fortune
              </div>
            </div>

            <div className="p-8">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-amber-700">Fortune Message</h3>
                </div>
                <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-wrap">{drawnFortune.content}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Sun className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-sm text-stone-500 mb-1">Fortune Type</p>
                  <p className="font-semibold text-stone-800">{drawnFortune.type}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-stone-500 mb-1">Lucky Index</p>
                  <p className="font-semibold text-stone-800">{luckyNumber}</p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Draw Again
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-stone-400">
            Fortune contents are for wellness reference and entertainment only. Each draw is completely random.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          75% { transform: translateX(5px) rotate(5deg); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}