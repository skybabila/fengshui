'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { BookOpen, Clock, Search, ArrowRight, Sparkles, TrendingUp, Heart, FileText, ChevronRight, Pin } from 'lucide-react'

const categories = ['All', 'Feng Shui', 'Fortune', 'Wellness', 'History', 'Philosophy']

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
          .eq('status', 'published')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
        
        if (dbArticles && dbArticles.length > 0) {
          setArticles(dbArticles)
        } else {
          setArticles([])
        }
      } catch (error) {
        console.error('Error fetching articles:', error)
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Separate pinned and unpinned articles
  const pinnedArticles = filteredArticles.filter(a => a.is_pinned)
  const unpinnedArticles = filteredArticles.filter(a => !a.is_pinned)

  // Get featured article (first pinned, or first unpinned)
  const getFeaturedArticle = () => {
    if (pinnedArticles.length > 0) {
      return pinnedArticles[0]
    }
    return unpinnedArticles.length > 0 ? unpinnedArticles[0] : null
  }

  const featuredArticle = getFeaturedArticle()

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Feng Shui': 'from-emerald-500 to-teal-600',
      'Fortune': 'from-amber-500 to-orange-600',
      'Wellness': 'from-purple-500 to-pink-600',
      'History': 'from-blue-500 to-indigo-600',
      'Philosophy': 'from-rose-500 to-red-600',
    }
    return colors[category] || 'from-emerald-500 to-teal-600'
  }

  const getCategoryBgColor = (category: string) => {
    const colors: Record<string, string> = {
      'Feng Shui': 'bg-emerald-100 text-emerald-700',
      'Fortune': 'bg-amber-100 text-amber-700',
      'Wellness': 'bg-purple-100 text-purple-700',
      'History': 'bg-blue-100 text-blue-700',
      'Philosophy': 'bg-rose-100 text-rose-700',
    }
    return colors[category] || 'bg-emerald-100 text-emerald-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg shadow-emerald-200">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-stone-700">Loading wisdom...</h2>
        </div>
      </div>
    )
  }

  const ArticleCardWithImage = ({ article }: { article: any }) => (
    <Link href={`/articles/${article.id}`}>
      <article className="group h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col relative">
        {article.is_pinned && (
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <Pin className="w-3 h-3" />
            Pinned
          </div>
        )}
        <div className="relative h-52 overflow-hidden bg-stone-100">
          {article.image ? (
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://neeko-copilot.bytedance.net/api/text_to_image?prompt=${encodeURIComponent(article.title + ' feng shui ancient wisdom')}&image_size=landscape_4_3`
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
              <BookOpen className="w-12 h-12 text-emerald-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className={`absolute top-4 left-4 px-3 py-1 bg-gradient-to-r ${getCategoryColor(article.category)} rounded-full text-white text-xs font-medium shadow-lg`}>
            {article.category}
          </div>
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <ArrowRight className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-stone-800 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight">
            {article.title}
          </h3>
          <p className="text-stone-500 text-sm line-clamp-2 mb-4 flex-1">{article.excerpt}</p>
          <div className="flex items-center justify-between text-xs text-stone-400 pt-4 border-t border-stone-100">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDate(article.created_at)}</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {article.author}</span>
          </div>
        </div>
      </article>
    </Link>
  )

  const ArticleCardWithoutImage = ({ article }: { article: any }) => (
    <Link href={`/articles/${article.id}`}>
      <article className="group h-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col border border-stone-100 relative overflow-hidden">
        {article.is_pinned && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <Pin className="w-3 h-3" />
            Pinned
          </div>
        )}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 ${getCategoryBgColor(article.category)} rounded-full text-xs font-medium mb-4 w-fit`}>
          <FileText className="w-3 h-3" />
          {article.category}
        </div>
        
        <h3 className="text-xl font-bold text-stone-800 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
          {article.title}
        </h3>
        
        <p className="text-stone-500 text-sm line-clamp-3 mb-4 flex-1 leading-relaxed">{article.excerpt}</p>
        
        <div className="flex items-center justify-between text-xs text-stone-400 pt-4 border-t border-stone-100">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDate(article.created_at)}</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium group-hover:gap-2 transition-all">
            Read more <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </article>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50/30 to-teal-50/30">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Ancient Wisdom for Modern Living
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Feng Shui Articles & Practical Guides</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">Find actionable home Feng Shui tips, zodiac horoscopes and spiritual insights to improve your wealth, relationship and home environment.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filter */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-lg w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search home layout, zodiac luck & fortune tips…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm text-lg"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200 transform scale-105'
                    : 'bg-white text-stone-600 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Article - Only show if has image */}
        {featuredArticle && featuredArticle.image && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-stone-800">Featured Article</h2>
              {featuredArticle.is_pinned && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  <Pin className="w-3 h-3" />
                  Pinned
                </span>
              )}
            </div>
            <Link href={`/articles/${featuredArticle.id}`}>
              <div className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-80 overflow-hidden bg-stone-100">
                    {featuredArticle.image ? (
                      <Image
                        src={featuredArticle.image}
                        alt={featuredArticle.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        priority
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://neeko-copilot.bytedance.net/api/text_to_image?prompt=${encodeURIComponent(featuredArticle.title + ' feng shui ancient wisdom')}&image_size=landscape_4_3`
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                        <Sparkles className="w-16 h-16 text-emerald-400" />
                      </div>
                    )}
                    <div className={`absolute top-4 left-4 px-4 py-2 bg-gradient-to-r ${getCategoryColor(featuredArticle.category)} rounded-full text-white text-sm font-medium shadow-lg`}>
                      {featuredArticle.category}
                    </div>
                  </div>
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4 group-hover:text-emerald-700 transition-colors leading-tight">
                      {featuredArticle.title}
                    </h3>
                    <p className="text-stone-600 mb-6 line-clamp-3 text-lg">{featuredArticle.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-stone-400">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatDate(featuredArticle.created_at)}</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {featuredArticle.author}</span>
                      </div>
                      <span className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-4 transition-all">
                        Read More <ArrowRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Pinned Articles Section - Only show pinned articles without images */}
        {pinnedArticles.length > 0 && unpinnedArticles.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Pin className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold text-stone-800">Pinned Articles</h2>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-sm rounded-full">{pinnedArticles.length}</span>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pinnedArticles.map((article) => (
                <div key={article.id} className="h-full">
                  {article.image ? (
                    <ArticleCardWithImage article={article} />
                  ) : (
                    <ArticleCardWithoutImage article={article} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Articles Grid - Mixed Layout */}
        {filteredArticles.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-stone-800">
                {pinnedArticles.length > 0 ? 'Latest Articles' : 'All Articles'}
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-sm rounded-full">{filteredArticles.length}</span>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <div key={article.id} className="h-full">
                  {article.image ? (
                    <ArticleCardWithImage article={article} />
                  ) : (
                    <ArticleCardWithoutImage article={article} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-stone-300" />
            </div>
            <h3 className="text-xl font-semibold text-stone-700 mb-2">No articles found</h3>
            <p className="text-stone-500">Check back later for new content</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-10 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Heart className="absolute top-5 left-10 w-16 h-16 animate-pulse" />
            <Heart className="absolute bottom-5 right-10 w-12 h-12 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-3">Ready to Boost Your Personal Luck?</h3>
            <p className="text-emerald-100 mb-6 max-w-lg mx-auto">Join our member community to get customized Feng Shui advice and daily fortune horoscopes.</p>
            <Link href="/daily-fortune" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg">
              Get Your Daily Fortune
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
