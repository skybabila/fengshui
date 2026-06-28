import Link from 'next/link'
import Image from 'next/image'
import { Compass, Sparkles, Heart, TrendingUp, ArrowRight } from 'lucide-react'

const elements = [
  { name: 'Wood', desc: 'Growth, vitality, new opportunities & fresh beginnings', color: 'from-green-500 to-emerald-600', emoji: '🌿' },
  { name: 'Fire', desc: 'Passion, career momentum & life transformation', color: 'from-orange-500 to-red-500', emoji: '🔥' },
  { name: 'Earth', desc: 'Stability, family luck, wealth accumulation & grounding', color: 'from-amber-500 to-yellow-600', emoji: '🪨' },
  { name: 'Metal', desc: 'Clarity, decision-making, financial precision & inner strength', color: 'from-stone-400 to-stone-600', emoji: '⚔️' },
  { name: 'Water', desc: 'Flow, prosperity, adaptability & continuous good fortune', color: 'from-blue-500 to-cyan-600', emoji: '💧' },
]

const zodiacSigns = [
  { sign: 'Rat', symbol: '🐀', element: 'Water', trait: 'Quick-witted' },
  { sign: 'Ox', symbol: '🐂', element: 'Earth', trait: 'Hardworking' },
  { sign: 'Tiger', symbol: '🐅', element: 'Wood', trait: 'Brave' },
  { sign: 'Rabbit', symbol: '🐇', element: 'Wood', trait: 'Gentle' },
  { sign: 'Dragon', symbol: '🐉', element: 'Earth', trait: 'Powerful' },
  { sign: 'Snake', symbol: '🐍', element: 'Fire', trait: 'Wise' },
  { sign: 'Horse', symbol: '🐎', element: 'Fire', trait: 'Energetic' },
  { sign: 'Goat', symbol: '🐐', element: 'Earth', trait: 'Creative' },
  { sign: 'Monkey', symbol: '🐒', element: 'Metal', trait: 'Clever' },
  { sign: 'Rooster', symbol: '🐓', element: 'Metal', trait: 'Confident' },
  { sign: 'Dog', symbol: '🐕', element: 'Earth', trait: 'Loyal' },
  { sign: 'Pig', symbol: '🐷', element: 'Water', trait: 'Kind' },
]

const articles = [
  {
    title: 'Understanding the Five Elements in Feng Shui',
    excerpt: 'Learn how Wood, Fire, Earth, Metal and Water interact. Fix stagnant energy in your house and attract positive wealth flow.',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=feng%20shui%20five%20elements%20meditation%20peaceful&image_size=landscape_4_3',
    slug: 'five-elements-feng-shui',
    date: 'Jan 15, 2026',
    category: 'Feng Shui',
  },
  {
    title: 'Creating Harmonious Spaces',
    excerpt: 'Easy home workspace tweaks to remove bad Qi and build a prosperous living environment.',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=harmonious%20chinese%20interior%20design%20feng%20shui&image_size=landscape_4_3',
    slug: 'harmonious-spaces',
    date: 'Jan 10, 2026',
    category: 'Interior Design',
  },
  {
    title: 'Daily Feng Shui Practices',
    excerpt: '5-minute morning rituals to align your energy and bring better luck every single day.',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=morning%20meditation%20zen%20peaceful%20garden&image_size=landscape_4_3',
    slug: 'daily-feng-shui-practices',
    date: 'Jan 5, 2026',
    category: 'Daily Practice',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-20 md:py-28">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-300 rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-emerald-700">Ancient Wisdom, Modern Luck</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 mb-6 leading-tight animate-fade-in-up">
            Unlock Your Good Fortune &
            <span className="block mt-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Harmonize Your Living Space
            </span>
          </h1>

          <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Master authentic Chinese Feng Shui. Optimize your home energy, boost wealth and health, and reveal your true destiny with time-tested traditional wisdom.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/articles"
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all hover:-translate-y-1"
            >
              Grab My Free Home Feng Shui Guide
            </Link>
            <Link
              href="/daily-fortune"
              className="px-8 py-4 border-2 border-emerald-200 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all hover:-translate-y-1"
            >
              Check Your Free Zodiac Reading
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-stone-500 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              10,000+ Active Members
            </span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Personalized Horoscopes
            </span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-pink-500" />
              98% User Satisfaction
            </span>
          </div>
        </div>
      </section>

      {/* Five Elements Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">The Five Core Elements</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Every corner of the universe is governed by these five energies. Master their cycles to balance your home and personal luck.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {elements.map((element, index) => (
              <div
                key={element.name}
                className="group relative rounded-2xl p-6 bg-gradient-to-br bg-stone-50 hover:bg-white border border-stone-100 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${element.color} flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl">{element.emoji}</span>
                </div>
                <h3 className="text-lg font-bold text-stone-800 text-center mb-2">{element.name}</h3>
                <p className="text-sm text-stone-500 text-center leading-relaxed">{element.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chinese Zodiac Section */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Chinese Zodiac Forecast</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Find your animal sign and unlock your innate personality, yearly luck and life path from Chinese astrology.
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-4">
            {zodiacSigns.map((zodiac, index) => (
              <div
                key={zodiac.sign}
                className="group rounded-xl p-4 bg-white/80 backdrop-blur-sm border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all duration-300 text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{zodiac.symbol}</div>
                <h3 className="font-semibold text-stone-800 text-sm">{zodiac.sign}</h3>
                <p className="text-xs text-emerald-600 mt-1">{zodiac.element}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Insights Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Practical Feng Shui Guides</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Simple home layout tips, daily luck rituals and holistic wellness advice for modern life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <Link
                key={index}
                href={`/articles/${article.slug}`}
                className="group rounded-2xl overflow-hidden border border-stone-200 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-stone-400">{article.date}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs text-emerald-600 font-medium">5 min read</span>
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-stone-500 text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                  <div className="inline-flex items-center gap-1 text-emerald-600 font-medium text-sm group-hover:gap-2 transition-all">
                    Read article <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-emerald-200 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-20 w-60 h-60 border-2 border-white rounded-full"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join Our Fortune Community</h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Create your free account to unlock exclusive perks:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-10 text-left">
            {[
              'Daily personalized fortune predictions',
              'Custom energy & zodiac analysis',
              'Virtual temple prayer & wish wall blessings',
              'Free merit coins for premium readings',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-white/90">
                <span className="text-emerald-300 text-lg">✅</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-emerald-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              Create Free Account
            </Link>
            <Link
              href="/daily-fortune"
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Check Today&apos;s Lucky Fortune
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-stone-800">10K+</h3>
              <p className="text-stone-500 text-sm mt-1">Active Members</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-3xl font-bold text-stone-800">50K+</h3>
              <p className="text-stone-500 text-sm mt-1">Prayers Offered</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-3xl font-bold text-stone-800">100+</h3>
              <p className="text-stone-500 text-sm mt-1">In-depth Guides</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-3xl font-bold text-stone-800">98%</h3>
              <p className="text-stone-500 text-sm mt-1">Positive Feedback</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
