'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Clock, User, Tag, BookOpen, Share2, Heart, MessageCircle, Sparkles } from 'lucide-react'



export default function ArticleDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [relatedArticles, setRelatedArticles] = useState<any[]>([])
  const defaultImage = 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=feng%20shui%20ancient%20wisdom%20peaceful&image_size=landscape_4_3'

  useEffect(() => {
    async function fetchArticle() {
      try {
        const { data: dbArticle } = await supabase
          .from('articles')
          .select('*')
          .eq('id', parseInt(id))
          .eq('status', 'published')
          .single()

        if (dbArticle) {
          setArticle(dbArticle)
          // Fetch related articles
          const { data: related } = await supabase
            .from('articles')
            .select('*')
            .eq('category', dbArticle.category)
            .eq('status', 'published')
            .neq('id', parseInt(id))
            .limit(3)
          setRelatedArticles(related || [])
        }
      } catch (error) {
        console.error('Error fetching article:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg shadow-emerald-200">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-stone-700">Loading article...</h2>
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

  const hasImage = !!article.image

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50/20 to-teal-50/20">
      {/* Hero Section - with or without image */}
      {hasImage ? (
        <div className="relative h-80 md:h-[500px] overflow-hidden">
          <Image
            src={article.image || defaultImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/30 to-transparent" />
          
          <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 border border-white/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors backdrop-blur-sm px-4 py-2 rounded-full bg-white/10 hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Articles
              </Link>
              
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getCategoryColor(article.category)} rounded-full text-white text-sm font-medium shadow-lg mb-4`}>
                <Tag className="w-4 h-4" />
                {article.category}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-3xl">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm">
                <span className="flex items-center gap-2"><User className="w-4 h-4" /> {article.author}</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {formatDate(article.date || article.created_at)}</span>
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> 5 min read</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          <div className="max-w-4xl mx-auto relative z-10">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Articles
            </Link>
            
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4`}>
              <Tag className="w-4 h-4" />
              {article.category}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-3xl">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm">
              <span className="flex items-center gap-2"><User className="w-4 h-4" /> {article.author}</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {formatDate(article.date || article.created_at)}</span>
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> 5 min read</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Share & Actions */}
        <div className="flex items-center justify-between mb-10 pb-8 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all text-stone-600 hover:text-emerald-600">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Save</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all text-stone-600 hover:text-emerald-600">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all text-stone-600 hover:text-emerald-600">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Comments</span>
          </button>
        </div>

        {/* Article Content */}
        <article className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12">
          {/* Excerpt */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-10 border-l-4 border-emerald-500">
            <p className="text-lg text-stone-700 italic leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Content */}
          <div
            className="article-content prose prose-lg max-w-none
              prose-headings:text-stone-800 prose-headings:font-bold prose-headings:text-2xl prose-headings:mt-10 prose-headings:mb-4
              prose-p:text-stone-600 prose-p:leading-loose prose-p:text-lg prose-p:my-4
              prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:text-emerald-700
              prose-strong:text-stone-700 prose-strong:font-semibold
              prose-li:text-stone-600 prose-li:text-lg prose-li:my-2
              prose-ul:my-6 prose-ol:my-6 prose-ul:space-y-2 prose-ol:space-y-2
              prose-hr:border-stone-200 prose-hr:my-8
              prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-stone-700
              prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8 prose-img:mx-auto prose-img:max-w-full"
            dangerouslySetInnerHTML={{ __html: article.content || article.excerpt }}
          />
          
          {/* Author Box */}
          <div className="mt-12 pt-8 border-t border-stone-200">
            <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-stone-50 to-stone-100 rounded-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {article.author?.charAt(0) || 'M'}
              </div>
              <div>
                <p className="font-bold text-stone-800 text-lg">{article.author || 'Master Li'}</p>
                <p className="text-stone-500 text-sm">Feng Shui Master & Writer</p>
                <p className="text-stone-600 text-sm mt-1">Sharing ancient wisdom for modern living</p>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              Related Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link href={`/articles/${related.id}`} key={related.id}>
                  <article className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={related.image || defaultImage}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-stone-800 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {related.title}
                      </h3>
                      <p className="text-sm text-stone-500 mt-2 line-clamp-2">{related.excerpt}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back CTA */}
        <div className="text-center">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-200 transition-all font-semibold"
          >
            <BookOpen className="w-5 h-5" />
            Explore More Articles
          </Link>
        </div>
      </div>
    </div>
  )
}
