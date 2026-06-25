'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Clock, User, Tag, BookOpen } from 'lucide-react'

const sampleArticles: Record<number, any> = {
  1: { id: 1, title: 'Understanding the Five Elements in Feng Shui', excerpt: 'Learn how the five elements - Wood, Fire, Earth, Metal, and Water - interact and influence your life and environment.', category: 'Feng Shui', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=feng%20shui%20five%20elements%20meditation%20peaceful&image_size=landscape_4_3', author: 'Master Li', date: '2024-01-15', content: '<p>The Five Elements theory is one of the most fundamental concepts in Chinese philosophy and Feng Shui practice. These elements - Wood, Fire, Earth, Metal, and Water - represent different types of energy that interact in cycles of creation and destruction.</p><h2 class="text-xl font-bold mt-6 mb-3">The Productive Cycle</h2><p>Wood feeds Fire, Fire creates Earth (ash), Earth bears Metal, Metal carries Water, and Water nourishes Wood. This cycle represents harmony and growth.</p><h2 class="text-xl font-bold mt-6 mb-3">The Controlling Cycle</h2><p>Wood parts Earth, Earth absorbs Water, Water extinguishes Fire, Fire melts Metal, and Metal chops Wood. This cycle represents balance and restraint.</p><h2 class="text-xl font-bold mt-6 mb-3">Applying the Five Elements</h2><p>In your home, you can balance these elements through colors, shapes, and materials. For example, adding green plants (Wood) to a room with too much red (Fire) can help create harmony.</p>' },
  2: { id: 2, title: 'Creating Harmonious Spaces', excerpt: 'Discover practical tips for arranging your home and workspace to promote positive energy flow and balance.', category: 'Feng Shui', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=harmonious%20chinese%20interior%20design%20feng%20shui&image_size=landscape_4_3', author: 'Master Li', date: '2024-01-12', content: '<p>Creating a harmonious living space is essential for your well-being. Feng Shui teaches us that the arrangement of our environment directly affects our energy and fortune.</p><h2 class="text-xl font-bold mt-6 mb-3">The Command Position</h2><p>Place your bed, desk, and stove in the command position - where you can see the door without being directly in line with it. This gives you a sense of security and control.</p><h2 class="text-xl font-bold mt-6 mb-3">Clear the Clutter</h2><p>Clutter blocks the flow of Qi. Keep your space clean and organized. Each item should have a purpose and a place.</p><h2 class="text-xl font-bold mt-6 mb-3">Natural Light and Air</h2><p>Open windows regularly to let fresh air and natural light circulate. These are essential for maintaining positive energy in any space.</p>' },
  3: { id: 3, title: 'Daily Feng Shui Practices', excerpt: 'Simple rituals and practices to align your daily life with natural energy patterns for greater well-being.', category: 'Wellness', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=morning%20meditation%20zen%20peaceful%20garden&image_size=landscape_4_3', author: 'Master Li', date: '2024-01-10', content: '<p>Incorporating Feng Shui into your daily routine doesn\'t have to be complicated. Here are some simple practices you can start today.</p><h2 class="text-xl font-bold mt-6 mb-3">Morning Ritual</h2><p>Start your day by opening curtains and windows to let in fresh energy. Take a few deep breaths and set a positive intention for the day.</p><h2 class="text-xl font-bold mt-6 mb-3">Mindful Eating</h2><p>Eat meals at a clean, uncluttered table. Avoid eating in front of screens. The energy around your food affects its nourishment.</p><h2 class="text-xl font-bold mt-6 mb-3">Evening Wind-Down</h2><p>Dim the lights an hour before bed. Remove electronic devices from the bedroom. Create a calm, restorative environment for sleep.</p>' },
  4: { id: 4, title: 'Chinese Zodiac and Personality', excerpt: 'Explore how your zodiac sign influences your personality traits and life path according to Chinese astrology.', category: 'Fortune', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20zodiac%20symbols%20traditional&image_size=landscape_4_3', author: 'Master Li', date: '2024-01-08', content: '<p>The Chinese Zodiac is a repeating cycle of 12 years, with each year represented by an animal sign. Your zodiac sign can reveal insights about your personality and destiny.</p><h2 class="text-xl font-bold mt-6 mb-3">The 12 Animals</h2><p>Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, and Pig - each brings unique characteristics and energies.</p><h2 class="text-xl font-bold mt-6 mb-3">Elements and Animals</h2><p>Each zodiac year is also associated with one of the five elements, creating a 60-year cycle. This combination further refines the personality traits of each sign.</p>' },
  5: { id: 5, title: 'History of Feng Shui', excerpt: 'Trace the origins and evolution of Feng Shui from ancient China to modern practices.', category: 'History', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=ancient%20chinese%20temple%20traditional&image_size=landscape_4_3', author: 'Master Li', date: '2024-01-05', content: '<p>Feng Shui has a rich history spanning over 3,000 years. Its origins can be traced back to ancient Chinese astronomy and philosophy.</p><h2 class="text-xl font-bold mt-6 mb-3">Ancient Origins</h2><p>The earliest forms of Feng Shui were used to select auspicious burial sites. Over time, the practice evolved to include the placement of homes and buildings.</p><h2 class="text-xl font-bold mt-6 mb-3">The Classical Schools</h2><p>The Form School focuses on the shape of the land and natural features. The Compass School uses the Bagua and Luo Pan to analyze energy patterns.</p><h2 class="text-xl font-bold mt-6 mb-3">Modern Feng Shui</h2><p>Today, Feng Shui has been adapted for modern living, combining traditional wisdom with contemporary design principles.</p>' },
  6: { id: 6, title: 'The Philosophy of Qi', excerpt: 'Deep dive into the concept of Qi (life energy) and its role in traditional Chinese philosophy.', category: 'Philosophy', image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20philosophy%20meditation%20peaceful&image_size=landscape_4_3', author: 'Master Li', date: '2024-01-03', content: '<p>Qi (pronounced "chee") is the fundamental life force energy that flows through all living things. Understanding Qi is essential to understanding Chinese philosophy and medicine.</p><h2 class="text-xl font-bold mt-6 mb-3">What is Qi?</h2><p>Qi is the vital energy that animates the universe. It flows through everything - the earth, the sky, our bodies, and our homes. When Qi flows smoothly, there is health and harmony.</p><h2 class="text-xl font-bold mt-6 mb-3">Qi in the Body</h2><p>In Traditional Chinese Medicine, Qi flows through meridians in the body. Blockages or imbalances in Qi flow can lead to illness. Practices like acupuncture and Tai Chi help restore proper Qi flow.</p><h2 class="text-xl font-bold mt-6 mb-3">Qi in Your Home</h2><p>In Feng Shui, we arrange our spaces to allow Qi to flow freely. Sharp corners, clutter, and poor lighting can create stagnant or "sha" Qi, which can negatively affect your well-being.</p>' },
}

export default function ArticleDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticle() {
      try {
        // Try fetching from Supabase
        const { data: dbArticle } = await supabase
          .from('articles')
          .select('*')
          .eq('id', parseInt(id))
          .single()

        if (dbArticle) {
          setArticle(dbArticle)
        } else {
          // Fallback to sample data
          const numId = parseInt(id)
          if (sampleArticles[numId]) {
            setArticle(sampleArticles[numId])
          }
        }
      } catch {
        // Fallback to sample data
        const numId = parseInt(id)
        if (sampleArticles[numId]) {
          setArticle(sampleArticles[numId])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <BookOpen className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-stone-700 mb-2">Article Not Found</h2>
          <p className="text-stone-500 mb-4">The article you are looking for does not exist.</p>
          <Link href="/articles" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Back to Articles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-20 relative z-10">
        {/* Back Link */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>

        {/* Article Card */}
        <article className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Category Badge */}
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            {article.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-stone-500 text-sm mb-8 pb-8 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDate(article.date || article.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>{article.category}</span>
            </div>
          </div>

          {/* Content */}
          <div
            className="prose prose-stone prose-lg max-w-none
              prose-headings:text-stone-800 prose-headings:font-bold
              prose-p:text-stone-600 prose-p:leading-relaxed
              prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:text-emerald-700
              prose-strong:text-stone-700
              prose-li:text-stone-600"
            dangerouslySetInnerHTML={{ __html: article.content || article.excerpt }}
          />
        </article>

        {/* Bottom Navigation */}
        <div className="mt-8 text-center">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            <BookOpen className="w-5 h-5" />
            Explore More Articles
          </Link>
        </div>
      </div>
    </div>
  )
}