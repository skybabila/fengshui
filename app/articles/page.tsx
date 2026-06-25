'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { BookOpen, Clock, ArrowRight, Search } from 'lucide-react'

const categories = ['All', 'Feng Shui', 'Fortune', 'Wellness', 'History', 'Philosophy']

const sampleArticles = [
  {
    id: 1,
    title: 'Understanding the Five Elements in Feng Shui',
    excerpt: 'Learn how the five elements - Wood, Fire, Earth, Metal, and Water - interact and influence your life and environment.',
    category: 'Feng Shui',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=feng%20shui%20five%20elements%20meditation%20peaceful&image_size=landscape_4_3',
    author: 'Master Li',
    date: '2024-01-15',
  },
  {
    id: 2,
    title: 'Creating Harmonious Spaces',
    excerpt: 'Discover practical tips for arranging your home and workspace to promote positive energy flow and balance.',
    category: 'Feng Shui',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=harmonious%20chinese%20interior%20design%20feng%20shui&image_size=landscape_4_3',
    author: 'Master Li',
    date: '2024-01-12',
  },
  {
    id: 3,
    title: 'Daily Feng Shui Practices',
    excerpt: 'Simple rituals and practices to align your daily life with natural energy patterns for greater well-being.',
    category: 'Wellness',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=morning%20meditation%20zen%20peaceful%20garden&image_size=landscape_4_3',
    author: 'Master Li',
    date: '2024-01-10',
  },
  {
    id: 4,
    title: 'Chinese Zodiac and Personality',
    excerpt: 'Explore how your zodiac sign influences your personality traits and life path according to Chinese astrology.',
    category: 'Fortune',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20zodiac%20symbols%20traditional&image_size=landscape_4_3',
    author: 'Master Li',
    date: '2024-01-08',
  },
  {
    id: 5,
    title: 'History of Feng Shui',
    excerpt: 'Trace the origins and evolution of Feng Shui from ancient China to modern practices.',
    category: 'History',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=ancient%20chinese%20temple%20traditional&image_size=landscape_4_3',
    author: 'Master Li',
    date: '2024-01-05',
  },
  {
    id: 6,
    title: 'The Philosophy of Qi',
    excerpt: 'Deep dive into the concept of Qi (life energy) and its role in traditional Chinese philosophy.',
    category: 'Philosophy',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20philosophy%20meditation%20peaceful&image_size=landscape_4_3',
    author: 'Master Li',
    date: '2024-01-03',
  },
]

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchArticles() {
      try {
        const { data: dbArticles } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (dbArticles && dbArticles.length > 0) {
          setArticles(dbArticles)
        } else {
          setArticles(sampleArticles)
        }
      } catch (error) {
        setArticles(sampleArticles)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Articles</h1>
          <p className="text-stone-500">Explore our collection of Feng Shui wisdom and insights</p>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-white text-stone-600 hover:bg-emerald-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Link href={`/articles/${article.id}`} key={article.id}>
              <article
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-emerald-600">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-stone-500 text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-stone-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(article.date)}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors">
                      Read more <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">No articles found in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}
