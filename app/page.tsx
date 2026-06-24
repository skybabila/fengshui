import Link from 'next/link'
import Image from 'next/image'
import { Compass, Sparkles, Heart, TrendingUp } from 'lucide-react'

const elements = [
  { name: 'Wood', color: 'from-green-500 to-emerald-600', description: 'Growth, vitality, new beginnings' },
  { name: 'Fire', color: 'from-orange-500 to-red-500', description: 'Passion, energy, transformation' },
  { name: 'Earth', color: 'from-amber-500 to-yellow-600', description: 'Stability, nourishment, grounding' },
  { name: 'Metal', color: 'from-stone-400 to-stone-600', description: 'Clarity, precision, strength' },
  { name: 'Water', color: 'from-blue-500 to-cyan-600', description: 'Flow, wisdom, adaptability' },
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
    excerpt: 'Learn how the five elements - Wood, Fire, Earth, Metal, and Water - interact and influence your life and environment.',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=feng%20shui%20five%20elements%20meditation%20peaceful&image_size=landscape_4_3',
  },
  {
    title: 'Creating Harmonious Spaces',
    excerpt: 'Discover practical tips for arranging your home and workspace to promote positive energy flow and balance.',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=harmonious%20chinese%20interior%20design%20feng%20shui&image_size=landscape_4_3',
  },
  {
    title: 'Daily Feng Shui Practices',
    excerpt: 'Simple rituals and practices to align your daily life with natural energy patterns for greater well-being.',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=morning%20meditation%20zen%20peaceful%20garden&image_size=landscape_4_3',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-20 md:py-28">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-300 rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-emerald-700">Ancient Wisdom, Modern Living</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-stone-800 mb-6 animate-fade-in-up">
            Embrace the Flow of
            <span className="block mt-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Life Energy
            </span>
          </h1>

          <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Discover the ancient art of Feng Shui. Learn to balance your space, enhance your well-being, and unlock your true potential through timeless Chinese wisdom.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/articles"
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all hover:-translate-y-1"
            >
              Explore Knowledge
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-emerald-200 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all hover:-translate-y-1"
            >
              Join Our Community
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">The Five Elements</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Everything in the universe is composed of five fundamental elements. Understanding their interactions is key to achieving balance.
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
                  <span className="text-3xl">
                    {element.name === 'Wood' && '🌿'}
                    {element.name === 'Fire' && '🔥'}
                    {element.name === 'Earth' && '🪨'}
                    {element.name === 'Metal' && '⚔️'}
                    {element.name === 'Water' && '💧'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-stone-800 text-center mb-2">{element.name}</h3>
                <p className="text-sm text-stone-500 text-center">{element.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Chinese Zodiac</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Discover your zodiac sign and its characteristics according to Chinese astrology.
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

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Latest Insights</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Explore our collection of articles on Feng Shui principles, daily practices, and holistic living.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <article
                key={index}
                className="group rounded-2xl overflow-hidden border border-stone-200 hover:shadow-xl transition-all duration-300 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-stone-500 text-sm line-clamp-2">{article.excerpt}</p>
                  <Link
                    href="/articles"
                    className="inline-flex items-center gap-1 mt-4 text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors"
                  >
                    Read more <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-emerald-200 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all"
            >
              View All Articles
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join Our Community</h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Sign up today to unlock exclusive features including daily fortune readings, personalized energy analysis, and access to our sacred temple prayer system.
          </p>
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
              Check Today&apos;s Fortune
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800">10K+</h3>
              <p className="text-stone-500 text-sm mt-1">Active Members</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800">50K+</h3>
              <p className="text-stone-500 text-sm mt-1">Prayers Offered</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800">100+</h3>
              <p className="text-stone-500 text-sm mt-1">Articles</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800">98%</h3>
              <p className="text-stone-500 text-sm mt-1">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
