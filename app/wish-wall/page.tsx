'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { Heart, Coins, Plus, Sparkles, CheckCircle, Clock, Star, TrendingUp, Lightbulb, PartyPopper, X, Pin, Trash2, Palette, RotateCcw } from 'lucide-react'

const WISH_COST = 10

const noteColors = [
  { bg: 'bg-yellow-200', border: 'border-yellow-300', text: 'text-yellow-900', pin: 'bg-red-500' },
  { bg: 'bg-pink-200', border: 'border-pink-300', text: 'text-pink-900', pin: 'bg-pink-500' },
  { bg: 'bg-blue-200', border: 'border-blue-300', text: 'text-blue-900', pin: 'bg-blue-500' },
  { bg: 'bg-green-200', border: 'border-green-300', text: 'text-green-900', pin: 'bg-green-500' },
  { bg: 'bg-purple-200', border: 'border-purple-300', text: 'text-purple-900', pin: 'bg-purple-500' },
  { bg: 'bg-orange-200', border: 'border-orange-300', text: 'text-orange-900', pin: 'bg-orange-500' },
  { bg: 'bg-rose-200', border: 'border-rose-300', text: 'text-rose-900', pin: 'bg-rose-500' },
  { bg: 'bg-teal-200', border: 'border-teal-300', text: 'text-teal-900', pin: 'bg-teal-500' },
  { bg: 'bg-amber-200', border: 'border-amber-300', text: 'text-amber-900', pin: 'bg-amber-600' },
  { bg: 'bg-cyan-200', border: 'border-cyan-300', text: 'text-cyan-900', pin: 'bg-cyan-500' },
  { bg: 'bg-lime-200', border: 'border-lime-300', text: 'text-lime-900', pin: 'bg-lime-600' },
  { bg: 'bg-fuchsia-200', border: 'border-fuchsia-300', text: 'text-fuchsia-900', pin: 'bg-fuchsia-500' },
  { bg: 'bg-indigo-200', border: 'border-indigo-300', text: 'text-indigo-900', pin: 'bg-indigo-500' },
  { bg: 'bg-red-200', border: 'border-red-300', text: 'text-red-900', pin: 'bg-red-600' },
  { bg: 'bg-sky-200', border: 'border-sky-300', text: 'text-sky-900', pin: 'bg-sky-500' },
  { bg: 'bg-emerald-200', border: 'border-emerald-300', text: 'text-emerald-900', pin: 'bg-emerald-500' },
]

const fulfilledColors = [
  { bg: 'bg-gradient-to-br from-amber-100 to-yellow-200', border: 'border-amber-400', text: 'text-amber-900', pin: 'bg-amber-600' },
  { bg: 'bg-gradient-to-br from-yellow-100 to-amber-200', border: 'border-yellow-500', text: 'text-yellow-900', pin: 'bg-yellow-600' },
]

const noteSizes = [
  { w: 'w-44', h: 'h-40', text: 'text-sm' },
  { w: 'w-48', h: 'h-44', text: 'text-sm' },
  { w: 'w-52', h: 'h-48', text: 'text-base' },
  { w: 'w-40', h: 'h-36', text: 'text-xs' },
  { w: 'w-56', h: 'h-52', text: 'text-base' },
]

const styleVariants = ['classic', 'polaroid', 'parchment', 'speech', 'star']

const decorationOptions = ['none', 'cornerStar', 'heartStamp', 'flowerDoodle', 'sparkleSticker']

const tapePositions = ['topRight', 'topLeft', 'bottomRight', 'bottomLeft', 'topCenter']

const fontStyles = ['normal', 'serif', 'mono', 'italic', 'cute']

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function getDeterministicValues(wish: any, customizations?: Record<string, any>) {
  const wishId = String(wish?.id || Math.random().toString())
  const isFulfilled = Boolean(wish?.is_fulfilled)
  const hash = hashCode(wishId)
  const colors = isFulfilled ? fulfilledColors : noteColors
  const custom = customizations?.[wishId]

  let colorIndex = hash % colors.length
  let sizeIndex = Math.floor(hash / 7) % noteSizes.length
  let rotation = ((hash % 12) - 6) * 0.8
  let topOffset = (hash % 30) - 10
  let leftOffset = (hash % 20) - 10

  if (custom?.colorIndex !== undefined && !isFulfilled) {
    colorIndex = custom.colorIndex % noteColors.length
  }

  const styleVariant = custom?.styleVariant || styleVariants[hash % styleVariants.length]
  const decoration = custom?.decoration || decorationOptions[hash % decorationOptions.length]
  const tapePosition = custom?.tapePosition || tapePositions[hash % tapePositions.length]
  const fontStyle = custom?.fontStyle || fontStyles[hash % fontStyles.length]

  return {
    color: colors[colorIndex],
    size: noteSizes[sizeIndex],
    rotation,
    topOffset,
    leftOffset,
    styleVariant,
    decoration,
    tapePosition,
    fontStyle,
    colorIndex,
  }
}

export default function WishWallPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [wishes, setWishes] = useState<any[]>([])
  const [newWish, setNewWish] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'fulfilled'>('all')
  const [showSuccess, setShowSuccess] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deletedWishes, setDeletedWishes] = useState<any[]>([])
  const [showTrashModal, setShowTrashModal] = useState(false)
  const [customizations, setCustomizations] = useState<Record<string, any>>({})
  const [customizingWishId, setCustomizingWishId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wish_customizations')
      if (saved) {
        setCustomizations(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load customizations:', e)
    }
  }, [])

  const saveCustomizations = useCallback((newCustomizations: Record<string, any>) => {
    setCustomizations(newCustomizations)
    try {
      localStorage.setItem('wish_customizations', JSON.stringify(newCustomizations))
    } catch (e) {
      console.error('Failed to save customizations:', e)
    }
  }, [])

  const updateWishCustomization = useCallback((wishId: string, updates: Partial<any>) => {
    const newCustomizations = {
      ...customizations,
      [wishId]: {
        ...customizations[wishId],
        ...updates,
      },
    }
    saveCustomizations(newCustomizations)
  }, [customizations, saveCustomizations])

  const fetchWishes = useCallback(async (userId: string) => {
    try {
      const { data: wishesData, error } = await supabase
        .from('wishes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error fetching wishes:', error)
        setWishes([])
        return
      }

      setWishes(wishesData || [])
    } catch (err) {
      console.error('Exception fetching wishes:', err)
      setWishes([])
    }
  }, [])

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

        await fetchWishes(authUser.id)
      } catch (error) {
        console.error('Error fetching data:', error)
        setPageError('Failed to load page. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fetchWishes])

  const points = profile?.points || 0
  const pendingWishes = wishes.filter((w: any) => !w?.is_fulfilled)
  const fulfilledWishes = wishes.filter((w: any) => w?.is_fulfilled)
  const displayWishes = activeTab === 'pending' 
    ? pendingWishes 
    : activeTab === 'fulfilled' 
      ? fulfilledWishes 
      : (wishes || [])

  const handleSubmitWish = async () => {
    if (!user || !newWish.trim()) return

    if (newWish.length > 200) {
      alert('Wish cannot exceed 200 characters')
      return
    }

    if (points < WISH_COST) {
      alert('Not enough merit coins to make a wish')
      return
    }

    setSubmitting(true)

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ points: points - WISH_COST })
        .eq('id', user.id)

      if (updateError) {
        alert('Failed to deduct coins: ' + updateError.message)
        setSubmitting(false)
        return
      }

      const { error: insertError } = await supabase
        .from('wishes')
        .insert({
          user_id: user.id,
          content: newWish.trim(),
          points_spent: WISH_COST,
          is_public: false,
          is_fulfilled: false,
        })
        .select()

      if (insertError) {
        console.error('Wish insert error:', insertError)
        alert('Failed to submit wish: ' + insertError.message)
        setSubmitting(false)
        return
      }

      try {
        await supabase
          .from('point_transactions')
          .insert({
            user_id: user.id,
            description: 'Wish wall - new wish',
            points: -WISH_COST
          })
      } catch (txErr) {
        console.warn('Transaction record failed (non-critical):', txErr)
      }

      setShowSuccess(true)
      setNewWish('')
      setShowForm(false)

      try {
        const updatedProfile = await getUserProfile(user.id)
        if (updatedProfile) {
          setProfile(updatedProfile)
        } else {
          setProfile((prev: any) => ({ ...prev, points: points - WISH_COST }))
        }
      } catch (e) {
        setProfile((prev: any) => ({ ...prev, points: points - WISH_COST }))
      }

      await fetchWishes(user.id)

      setTimeout(() => setShowSuccess(false), 3000)

    } catch (error: any) {
      console.error('Error submitting wish:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFulfillWish = async (wishId: string) => {
    if (!user) return
    if (!confirm('Mark this wish as fulfilled?')) return

    try {
      const { error } = await supabase
        .from('wishes')
        .update({ 
          is_fulfilled: true,
          fulfilled_at: new Date().toISOString()
        })
        .eq('id', wishId)
        .eq('user_id', user.id)

      if (error) {
        alert('Failed to update wish: ' + error.message)
        return
      }

      setWishes(wishes.map((w: any) => 
        w.id === wishId 
          ? { ...w, is_fulfilled: true, fulfilled_at: new Date().toISOString() }
          : w
      ))
    } catch (error) {
      console.error('Error fulfilling wish:', error)
      alert('Failed to update wish')
    }
  }

  const handleDeleteWish = (wishId: string) => {
    if (!confirm('Move this wish to trash?')) return
    const wishToDelete = wishes.find((w: any) => w.id === wishId)
    if (wishToDelete) {
      setDeletedWishes((prev) => [...prev, { ...wishToDelete, deleted_at: new Date().toISOString() }])
      setWishes(wishes.filter((w: any) => w.id !== wishId))
    }
  }

  const handleRestoreWish = (wishId: string) => {
    const wishToRestore = deletedWishes.find((w: any) => w.id === wishId)
    if (wishToRestore) {
      setWishes((prev) => [wishToRestore, ...prev].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ))
      setDeletedWishes(deletedWishes.filter((w: any) => w.id !== wishId))
    }
  }

  const handleDeleteForever = (wishId: string) => {
    if (!confirm('Permanently delete this wish? This cannot be undone.')) return
    setDeletedWishes(deletedWishes.filter((w: any) => w.id !== wishId))
    const newCustomizations = { ...customizations }
    delete newCustomizations[wishId]
    saveCustomizations(newCustomizations)
  }

  const handleEmptyTrash = () => {
    if (!confirm('Permanently delete ALL wishes in trash? This cannot be undone.')) return
    const deletedIds = deletedWishes.map((w: any) => w.id)
    const newCustomizations = { ...customizations }
    deletedIds.forEach((id: string) => delete newCustomizations[id])
    saveCustomizations(newCustomizations)
    setDeletedWishes([])
  }

  const getTapeClass = (position: string) => {
    switch (position) {
      case 'topLeft': return 'absolute -top-1 -left-1 w-6 h-6 bg-white/30 rotate-45'
      case 'topRight': return 'absolute -top-1 -right-1 w-6 h-6 bg-white/30 -rotate-45'
      case 'bottomLeft': return 'absolute -bottom-1 -left-1 w-6 h-6 bg-white/30 -rotate-45'
      case 'bottomRight': return 'absolute -bottom-1 -right-1 w-6 h-6 bg-white/30 rotate-45'
      case 'topCenter': return 'absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-5 bg-white/30'
      default: return 'absolute -top-1 -right-1 w-6 h-6 bg-white/30 -rotate-45'
    }
  }

  const getFontClass = (style: string) => {
    switch (style) {
      case 'serif': return 'font-serif'
      case 'mono': return 'font-mono'
      case 'italic': return 'italic'
      case 'cute': return 'font-serif italic'
      default: return ''
    }
  }

  const renderDecoration = (decoration: string, color: any) => {
    switch (decoration) {
      case 'cornerStar':
        return (
          <div className="absolute top-2 right-2 text-yellow-500 text-lg">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-500" />
          </div>
        )
      case 'heartStamp':
        return (
          <div className="absolute top-2 right-2 text-rose-500 text-lg opacity-60">
            <Heart className="w-5 h-5 fill-rose-400 text-rose-500" />
          </div>
        )
      case 'flowerDoodle':
        return (
          <div className="absolute top-2 right-2 text-pink-500 text-lg">
            <span className="text-xl">🌸</span>
          </div>
        )
      case 'sparkleSticker':
        return (
          <div className="absolute top-2 right-2 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
        )
      default:
        return null
    }
  }

  const renderWishCard = (wish: any, showActions: boolean = true, isTrash: boolean = false) => {
    const { color, size, rotation, topOffset, leftOffset, styleVariant, decoration, tapePosition, fontStyle } = getDeterministicValues(wish, customizations)

    const baseClasses = `relative ${size.w} ${size.h} ${color.bg} ${color.border} border-2 ${size.text} ${color.text} shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-default group ${getFontClass(fontStyle)}`

    if (styleVariant === 'polaroid') {
      return (
        <div
          key={wish.id}
          className={`relative ${size.w} ${size.h} bg-white border-2 border-stone-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-default group pb-10`}
          style={{
            transform: `rotate(${rotation}deg) translateY(${topOffset}px) translateX(${leftOffset}px)`,
          }}
        >
          <div className={`${color.bg} m-2 h-3/4 rounded-sm flex items-center justify-center p-2`}>
            <p className={`${color.text} ${size.text} ${getFontClass(fontStyle)} text-center leading-relaxed overflow-hidden`} style={{
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
            }}>
              {wish.content}
            </p>
          </div>
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <p className="text-xs text-stone-500 font-mono">{formatDate(wish.created_at)}</p>
          </div>
          {renderDecoration(decoration, color)}
          {showActions && !isTrash && !wish.is_fulfilled && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleFulfillWish(wish.id)
              }}
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md z-20"
              title="Mark as fulfilled"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {showActions && !isTrash && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCustomizingWishId(customizingWishId === wish.id ? null : wish.id)
                }}
                className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 shadow-md z-20"
                title="Customize"
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteWish(wish.id)
                }}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md z-20"
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          {customizingWishId === wish.id && !isTrash && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-30 bg-white rounded-xl shadow-2xl p-3 border border-stone-200 w-56">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-stone-700">Customize Wish</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCustomizingWishId(null)
                  }}
                  className="p-0.5 hover:bg-stone-100 rounded"
                >
                  <X className="w-3.5 h-3.5 text-stone-500" />
                </button>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Color</p>
                <div className="flex flex-wrap gap-1">
                  {noteColors.map((c, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { colorIndex: i })
                      }}
                      className={`w-5 h-5 rounded-full ${c.bg} border-2 ${c.border} hover:scale-110 transition-transform`}
                      title={`Color ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Style</p>
                <div className="flex flex-wrap gap-1">
                  {styleVariants.map((sv) => (
                    <button
                      key={sv}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { styleVariant: sv })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        styleVariant === sv
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {sv.charAt(0).toUpperCase() + sv.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Tape</p>
                <div className="flex flex-wrap gap-1">
                  {tapePositions.map((tp) => (
                    <button
                      key={tp}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { tapePosition: tp })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        tapePosition === tp
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {tp.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + tp.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Decoration</p>
                <div className="flex flex-wrap gap-1">
                  {decorationOptions.map((d) => (
                    <button
                      key={d}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { decoration: d })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        decoration === d
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {d === 'none' ? 'None' : d.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + d.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Font</p>
                <div className="flex flex-wrap gap-1">
                  {fontStyles.map((fs) => (
                    <button
                      key={fs}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { fontStyle: fs })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        fontStyle === fs
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {fs.charAt(0).toUpperCase() + fs.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (styleVariant === 'parchment') {
      return (
        <div
          key={wish.id}
          className={`relative ${size.w} ${size.h} bg-gradient-to-b from-amber-100 to-amber-50 border-2 border-amber-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-default group ${getFontClass(fontStyle)}`}
          style={{
            transform: `rotate(${rotation}deg) translateY(${topOffset}px) translateX(${leftOffset}px)`,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
          }}
        >
          <div className={`absolute -top-1 -left-1 w-3 h-full bg-amber-200 rounded-l-lg`}></div>
          <div className={`absolute -top-1 -right-1 w-3 h-full bg-amber-200 rounded-r-lg`}></div>
          <div className={`${color.text} p-4 pt-5 h-full flex flex-col`}>
            <p className="flex-1 leading-relaxed overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: wish.is_fulfilled ? 3 : 5,
              WebkitBoxOrient: 'vertical',
            }}>
              {wish.content}
            </p>
            <div className="mt-auto pt-2 border-t border-amber-300/50">
              <p className="text-xs opacity-70">
                {formatDate(wish.created_at)}
              </p>
            </div>
          </div>
          {renderDecoration(decoration, color)}
          {showActions && !isTrash && !wish.is_fulfilled && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleFulfillWish(wish.id)
              }}
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md z-20"
              title="Mark as fulfilled"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {showActions && !isTrash && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCustomizingWishId(customizingWishId === wish.id ? null : wish.id)
                }}
                className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 shadow-md z-20"
                title="Customize"
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteWish(wish.id)
                }}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md z-20"
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          {customizingWishId === wish.id && !isTrash && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-30 bg-white rounded-xl shadow-2xl p-3 border border-stone-200 w-56">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-stone-700">Customize Wish</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCustomizingWishId(null)
                  }}
                  className="p-0.5 hover:bg-stone-100 rounded"
                >
                  <X className="w-3.5 h-3.5 text-stone-500" />
                </button>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Color</p>
                <div className="flex flex-wrap gap-1">
                  {noteColors.map((c, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { colorIndex: i })
                      }}
                      className={`w-5 h-5 rounded-full ${c.bg} border-2 ${c.border} hover:scale-110 transition-transform`}
                      title={`Color ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Style</p>
                <div className="flex flex-wrap gap-1">
                  {styleVariants.map((sv) => (
                    <button
                      key={sv}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { styleVariant: sv })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        styleVariant === sv
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {sv.charAt(0).toUpperCase() + sv.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Tape</p>
                <div className="flex flex-wrap gap-1">
                  {tapePositions.map((tp) => (
                    <button
                      key={tp}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { tapePosition: tp })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        tapePosition === tp
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {tp.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + tp.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Decoration</p>
                <div className="flex flex-wrap gap-1">
                  {decorationOptions.map((d) => (
                    <button
                      key={d}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { decoration: d })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        decoration === d
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {d === 'none' ? 'None' : d.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + d.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Font</p>
                <div className="flex flex-wrap gap-1">
                  {fontStyles.map((fs) => (
                    <button
                      key={fs}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { fontStyle: fs })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        fontStyle === fs
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {fs.charAt(0).toUpperCase() + fs.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (styleVariant === 'speech') {
      return (
        <div
          key={wish.id}
          className={`relative ${size.w} ${size.h} ${color.bg} ${color.border} border-2 rounded-b-3xl ${size.text} ${color.text} shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-default group ${getFontClass(fontStyle)}`}
          style={{
            transform: `rotate(${rotation}deg) translateY(${topOffset}px) translateX(${leftOffset}px)`,
          }}
        >
          <div className="absolute -bottom-3 left-8 w-6 h-6">
            <div className={`absolute inset-0 ${color.bg} border-2 ${color.border} rotate-45 border-t-0 border-l-0`}></div>
          </div>
          <div className={`${color.text} p-4 pt-5 h-full flex flex-col`}>
            <p className="flex-1 leading-relaxed overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: wish.is_fulfilled ? 3 : 5,
              WebkitBoxOrient: 'vertical',
            }}>
              {wish.content}
            </p>
            <div className="mt-auto pt-2 border-t border-black/10">
              <p className="text-xs opacity-70">
                {formatDate(wish.created_at)}
              </p>
            </div>
          </div>
          {renderDecoration(decoration, color)}
          {showActions && !isTrash && !wish.is_fulfilled && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleFulfillWish(wish.id)
              }}
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md z-20"
              title="Mark as fulfilled"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {showActions && !isTrash && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCustomizingWishId(customizingWishId === wish.id ? null : wish.id)
                }}
                className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 shadow-md z-20"
                title="Customize"
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteWish(wish.id)
                }}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md z-20"
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          {customizingWishId === wish.id && !isTrash && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-30 bg-white rounded-xl shadow-2xl p-3 border border-stone-200 w-56">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-stone-700">Customize Wish</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCustomizingWishId(null)
                  }}
                  className="p-0.5 hover:bg-stone-100 rounded"
                >
                  <X className="w-3.5 h-3.5 text-stone-500" />
                </button>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Color</p>
                <div className="flex flex-wrap gap-1">
                  {noteColors.map((c, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { colorIndex: i })
                      }}
                      className={`w-5 h-5 rounded-full ${c.bg} border-2 ${c.border} hover:scale-110 transition-transform`}
                      title={`Color ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Style</p>
                <div className="flex flex-wrap gap-1">
                  {styleVariants.map((sv) => (
                    <button
                      key={sv}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { styleVariant: sv })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        styleVariant === sv
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {sv.charAt(0).toUpperCase() + sv.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Tape</p>
                <div className="flex flex-wrap gap-1">
                  {tapePositions.map((tp) => (
                    <button
                      key={tp}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { tapePosition: tp })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        tapePosition === tp
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {tp.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + tp.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Decoration</p>
                <div className="flex flex-wrap gap-1">
                  {decorationOptions.map((d) => (
                    <button
                      key={d}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { decoration: d })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        decoration === d
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {d === 'none' ? 'None' : d.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + d.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Font</p>
                <div className="flex flex-wrap gap-1">
                  {fontStyles.map((fs) => (
                    <button
                      key={fs}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { fontStyle: fs })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        fontStyle === fs
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {fs.charAt(0).toUpperCase() + fs.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (styleVariant === 'star') {
      return (
        <div
          key={wish.id}
          className={`relative ${size.w} ${size.h} ${color.bg} ${color.border} border-2 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-default group ${getFontClass(fontStyle)}`}
          style={{
            transform: `rotate(${rotation}deg) translateY(${topOffset}px) translateX(${leftOffset}px)`,
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          }}
        >
          <div className={`${color.text} p-6 pt-10 h-full flex flex-col items-center text-center`}>
            <p className={`${color.text} leading-relaxed overflow-hidden text-xs`} style={{
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
            }}>
              {wish.content}
            </p>
          </div>
          {showActions && !isTrash && !wish.is_fulfilled && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleFulfillWish(wish.id)
              }}
              className="absolute bottom-6 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md z-20"
              title="Mark as fulfilled"
            >
              <CheckCircle className="w-3 h-3" />
            </button>
          )}
          {showActions && !isTrash && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCustomizingWishId(customizingWishId === wish.id ? null : wish.id)
                }}
                className="absolute bottom-6 left-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-violet-500 text-white rounded-lg hover:bg-violet-600 shadow-md z-20"
                title="Customize"
              >
                <Palette className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteWish(wish.id)
                }}
                className="absolute top-6 left-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md z-20"
                title="Delete"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}
          {customizingWishId === wish.id && !isTrash && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-30 bg-white rounded-xl shadow-2xl p-3 border border-stone-200 w-56">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-stone-700">Customize Wish</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCustomizingWishId(null)
                  }}
                  className="p-0.5 hover:bg-stone-100 rounded"
                >
                  <X className="w-3.5 h-3.5 text-stone-500" />
                </button>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Color</p>
                <div className="flex flex-wrap gap-1">
                  {noteColors.map((c, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { colorIndex: i })
                      }}
                      className={`w-5 h-5 rounded-full ${c.bg} border-2 ${c.border} hover:scale-110 transition-transform`}
                      title={`Color ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Style</p>
                <div className="flex flex-wrap gap-1">
                  {styleVariants.map((sv) => (
                    <button
                      key={sv}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { styleVariant: sv })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        styleVariant === sv
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {sv.charAt(0).toUpperCase() + sv.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Tape</p>
                <div className="flex flex-wrap gap-1">
                  {tapePositions.map((tp) => (
                    <button
                      key={tp}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { tapePosition: tp })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        tapePosition === tp
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {tp.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + tp.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs text-stone-500 mb-1">Decoration</p>
                <div className="flex flex-wrap gap-1">
                  {decorationOptions.map((d) => (
                    <button
                      key={d}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { decoration: d })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        decoration === d
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {d === 'none' ? 'None' : d.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + d.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Font</p>
                <div className="flex flex-wrap gap-1">
                  {fontStyles.map((fs) => (
                    <button
                      key={fs}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateWishCustomization(wish.id, { fontStyle: fs })
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        fontStyle === fs
                          ? 'bg-violet-500 text-white border-violet-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {fs.charAt(0).toUpperCase() + fs.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        key={wish.id}
        className={`${baseClasses}`}
        style={{
          transform: `rotate(${rotation}deg) translateY(${topOffset}px) translateX(${leftOffset}px)`,
        }}
      >
        <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 ${color.pin} rounded-full shadow-md border-2 border-white/30 z-10`}>
          <div className="absolute inset-1 rounded-full bg-white/20"></div>
        </div>

        <div className={getTapeClass(tapePosition)}></div>

        {wish?.is_fulfilled && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 pointer-events-none">
            <div className="px-4 py-1.5 border-2 border-red-500 rounded-full">
              <span className="text-red-500 font-bold text-lg">FULFILLED!</span>
            </div>
          </div>
        )}

        {renderDecoration(decoration, color)}

        <div className="p-4 pt-5 h-full flex flex-col">
          <p className="flex-1 leading-relaxed overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: wish.is_fulfilled ? 3 : 5,
            WebkitBoxOrient: 'vertical',
          }}>
            {wish.content}
          </p>
          
          <div className="mt-auto pt-2 border-t border-black/10">
            <p className="text-xs opacity-70">
              {formatDate(wish.created_at)}
            </p>
            {wish.is_fulfilled && wish.fulfilled_at && (
              <p className="text-xs font-bold text-amber-700 mt-0.5">
                ✨ {formatDate(wish.fulfilled_at)}
              </p>
            )}
          </div>

          {!wish.is_fulfilled && showActions && !isTrash && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleFulfillWish(wish.id)
              }}
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md z-20"
              title="Mark as fulfilled"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}

          {showActions && !isTrash && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCustomizingWishId(customizingWishId === wish.id ? null : wish.id)
                }}
                className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 shadow-md z-20"
                title="Customize"
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteWish(wish.id)
                }}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md z-20"
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {customizingWishId === wish.id && !isTrash && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-30 bg-white rounded-xl shadow-2xl p-3 border border-stone-200 w-56">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-stone-700">Customize Wish</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCustomizingWishId(null)
                }}
                className="p-0.5 hover:bg-stone-100 rounded"
              >
                <X className="w-3.5 h-3.5 text-stone-500" />
              </button>
            </div>
            <div className="mb-2">
              <p className="text-xs text-stone-500 mb-1">Color</p>
              <div className="flex flex-wrap gap-1">
                {noteColors.map((c, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation()
                      updateWishCustomization(wish.id, { colorIndex: i })
                    }}
                    className={`w-5 h-5 rounded-full ${c.bg} border-2 ${c.border} hover:scale-110 transition-transform`}
                    title={`Color ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs text-stone-500 mb-1">Style</p>
              <div className="flex flex-wrap gap-1">
                {styleVariants.map((sv) => (
                  <button
                    key={sv}
                    onClick={(e) => {
                      e.stopPropagation()
                      updateWishCustomization(wish.id, { styleVariant: sv })
                    }}
                    className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                      styleVariant === sv
                        ? 'bg-violet-500 text-white border-violet-500'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {sv.charAt(0).toUpperCase() + sv.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs text-stone-500 mb-1">Tape</p>
              <div className="flex flex-wrap gap-1">
                {tapePositions.map((tp) => (
                  <button
                    key={tp}
                    onClick={(e) => {
                      e.stopPropagation()
                      updateWishCustomization(wish.id, { tapePosition: tp })
                    }}
                    className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                      tapePosition === tp
                        ? 'bg-violet-500 text-white border-violet-500'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {tp.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + tp.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs text-stone-500 mb-1">Decoration</p>
              <div className="flex flex-wrap gap-1">
                {decorationOptions.map((d) => (
                  <button
                    key={d}
                    onClick={(e) => {
                      e.stopPropagation()
                      updateWishCustomization(wish.id, { decoration: d })
                    }}
                    className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                      decoration === d
                        ? 'bg-violet-500 text-white border-violet-500'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {d === 'none' ? 'None' : d.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + d.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Font</p>
              <div className="flex flex-wrap gap-1">
                {fontStyles.map((fs) => (
                  <button
                    key={fs}
                    onClick={(e) => {
                      e.stopPropagation()
                      updateWishCustomization(wish.id, { fontStyle: fs })
                    }}
                    className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                      fontStyle === fs
                        ? 'bg-violet-500 text-white border-violet-500'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {fs.charAt(0).toUpperCase() + fs.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
            <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
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
              className="px-6 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
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
      <div className="p-6 md:p-8 relative">
        <div className="max-w-6xl mx-auto">

          {showSuccess && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-3">Wish Sealed ✨</h3>
                <p className="text-stone-600 leading-relaxed">
                  Your wish has been sealed and recorded on the wish wall.<br />
                  Good energy is flowing toward your goal.<br />
                  Come back often to track your blessing progress.
                </p>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {showTrashModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTrashModal(false)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-bold text-stone-800">Trash</h3>
                    <span className="text-sm text-stone-500">({deletedWishes.length})</span>
                  </div>
                  <button
                    onClick={() => setShowTrashModal(false)}
                    className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-stone-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {deletedWishes.length === 0 ? (
                    <div className="text-center py-12">
                      <Trash2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                      <p className="text-stone-500">Trash is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {deletedWishes.map((wish: any) => (
                        <div key={wish.id} className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                          <p className="text-stone-700 text-sm mb-2 line-clamp-2">{wish.content}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-stone-400">
                              Deleted {formatDate(wish.deleted_at)}
                            </p>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleRestoreWish(wish.id)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Restore
                              </button>
                              <button
                                onClick={() => handleDeleteForever(wish.id)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete Forever
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {deletedWishes.length > 0 && (
                  <div className="p-4 border-t border-stone-200">
                    <button
                      onClick={handleEmptyTrash}
                      className="w-full py-2 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                    >
                      Empty Trash
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-stone-800 mb-2 flex items-center justify-center gap-3">
              <span className="text-4xl">🎋</span>
              My Wish Wall
              <span className="text-4xl">🎋</span>
            </h1>
            <p className="text-stone-500 max-w-lg mx-auto text-sm">
              Write down your heartfelt wishes, pin them on the wall, and let positive energy bring you good fortune.
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-stone-200">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-stone-600">My Coins:</span>
              <span className="font-bold text-amber-600">{points.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-stone-200">
              <Clock className="w-4 h-4 text-pink-500" />
              <span className="text-sm text-stone-600">Pending:</span>
              <span className="font-bold text-pink-600">{pendingWishes.length}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-stone-200">
              <PartyPopper className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-stone-600">Fulfilled:</span>
              <span className="font-bold text-emerald-600">{fulfilledWishes.length}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
                  : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-1.5" />
              All Wishes
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1.5" />
              Pending
            </button>
            <button
              onClick={() => setActiveTab('fulfilled')}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                activeTab === 'fulfilled'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                  : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200'
              }`}
            >
              <PartyPopper className="w-4 h-4 inline mr-1.5" />
              Fulfilled
            </button>
          </div>

          {displayWishes.length > 0 ? (
            <div className="relative bg-gradient-to-br from-stone-700 via-stone-600 to-stone-700 rounded-3xl p-8 md:p-12 min-h-[500px] shadow-2xl mb-8 overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
              
              <div className="absolute top-3 left-0 right-0 flex justify-around opacity-40">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-yellow-300 shadow-lg shadow-yellow-400/50"></div>
                ))}
              </div>

              <div className="relative flex flex-wrap gap-6 md:gap-8 justify-center items-start py-4">
                {displayWishes.map((wish: any) => renderWishCard(wish))}
              </div>

              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-black/20 to-transparent rounded-tr-none rounded-bl-3xl"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-black/20 to-transparent rounded-tl-none rounded-br-3xl"></div>
            </div>
          ) : (
            <div className="text-center py-20 bg-gradient-to-br from-stone-700 to-stone-600 rounded-3xl mb-8 shadow-2xl">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-stone-300 text-lg mb-1">
                {activeTab === 'pending' 
                  ? 'No pending wishes' 
                  : activeTab === 'fulfilled' 
                    ? 'No fulfilled wishes yet'
                    : 'Your wish wall is empty'}
              </p>
              <p className="text-stone-400 text-sm">Pin your first wish on the wall below! ✨</p>
            </div>
          )}

          {!showForm ? (
            <div className="text-center mb-8">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white font-bold text-lg rounded-full shadow-xl shadow-pink-300 hover:shadow-2xl hover:shadow-pink-400 transition-all hover:-translate-y-1 relative overflow-hidden group"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-700"></span>
                <Plus className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Post a New Wish</span>
                <span className="text-sm opacity-80 relative z-10">(10 coins)</span>
              </button>
            </div>
          ) : (
            <div className="relative max-w-lg mx-auto mb-12">
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300 rounded-3xl blur-lg opacity-40"></div>
              
              <div className="relative bg-gradient-to-b from-pink-100 to-rose-100 rounded-3xl p-6 border-2 border-pink-200 shadow-xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full shadow-lg border-2 border-white/30 z-10">
                  <div className="absolute inset-1.5 rounded-full bg-white/20"></div>
                </div>

                <button
                  onClick={() => setShowForm(false)}
                  className="absolute top-3 right-3 p-1.5 text-pink-400 hover:text-pink-600 hover:bg-pink-200/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-4 pt-2">
                  <h2 className="text-lg font-bold text-pink-900 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                    Seal Your Wish
                    <Sparkles className="w-5 h-5 text-pink-500" />
                  </h2>
                  <p className="text-pink-600 text-sm mt-1">
                    10 Merit Coins • Lock in your blessing
                  </p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-pink-700 mb-2 font-medium">✨ Quick fill by category:</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-amber-600 font-semibold mb-1 flex items-center gap-1">
                        💰 Wealth
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { icon: '💰', text: 'Attract stable wealth and continuous good luck.' },
                          { icon: '🏦', text: 'May my business flourish and profits double.' },
                          { icon: '📈', text: 'Bless my investments to yield great returns.' },
                          { icon: '💎', text: 'Attract unexpected fortune and financial windfalls.' },
                        ].map((tpl, i) => (
                          <button
                            key={`w-${i}`}
                            onClick={() => setNewWish(tpl.text)}
                            disabled={submitting || points < WISH_COST}
                            className="text-xs px-2 py-1 bg-amber-50/70 border border-amber-200 text-amber-700 rounded-full hover:bg-amber-100 transition-colors disabled:opacity-50"
                          >
                            {tpl.icon} {tpl.text.length > 22 ? tpl.text.slice(0, 22) + '...' : tpl.text}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-rose-600 font-semibold mb-1 flex items-center gap-1">
                        ❤️ Love
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { icon: '💑', text: 'Find my soulmate and build a happy family.' },
                          { icon: '💕', text: 'Bless my relationship with harmony and sweetness.' },
                          { icon: '💍', text: 'May my marriage be filled with love and devotion.' },
                          { icon: '🌹', text: 'Attract true love and heartfelt companionship.' },
                        ].map((tpl, i) => (
                          <button
                            key={`l-${i}`}
                            onClick={() => setNewWish(tpl.text)}
                            disabled={submitting || points < WISH_COST}
                            className="text-xs px-2 py-1 bg-rose-50/70 border border-rose-200 text-rose-700 rounded-full hover:bg-rose-100 transition-colors disabled:opacity-50"
                          >
                            {tpl.icon} {tpl.text.length > 22 ? tpl.text.slice(0, 22) + '...' : tpl.text}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 font-semibold mb-1 flex items-center gap-1">
                        💪 Health
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { icon: '🏥', text: 'Grant me robust health and swift recovery from illness.' },
                          { icon: '🧘', text: 'Bestow inner peace and freedom from anxiety.' },
                          { icon: '🌿', text: 'Protect my body from diseases and injuries.' },
                          { icon: '😴', text: 'Bless me with restful sleep and renewed energy.' },
                        ].map((tpl, i) => (
                          <button
                            key={`h-${i}`}
                            onClick={() => setNewWish(tpl.text)}
                            disabled={submitting || points < WISH_COST}
                            className="text-xs px-2 py-1 bg-emerald-50/70 border border-emerald-200 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            {tpl.icon} {tpl.text.length > 22 ? tpl.text.slice(0, 22) + '...' : tpl.text}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold mb-1 flex items-center gap-1">
                        📚 Career
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { icon: '💼', text: 'Bless my career for steady promotion and higher income.' },
                          { icon: '📝', text: 'Grant me success in all upcoming examinations.' },
                          { icon: '🏆', text: 'Attract noble people to help advance my事业.' },
                          { icon: '🎯', text: 'Bless my projects to succeed beyond expectations.' },
                        ].map((tpl, i) => (
                          <button
                            key={`c-${i}`}
                            onClick={() => setNewWish(tpl.text)}
                            disabled={submitting || points < WISH_COST}
                            className="text-xs px-2 py-1 bg-blue-50/70 border border-blue-200 text-blue-700 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50"
                          >
                            {tpl.icon} {tpl.text.length > 22 ? tpl.text.slice(0, 22) + '...' : tpl.text}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 font-semibold mb-1 flex items-center gap-1">
                        👨‍👩‍👧 Family
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { icon: '👨‍👩‍👧', text: 'Keep my whole family safe and healthy all year long.' },
                          { icon: '🙏', text: 'Grant my parents longevity andfreedom from suffering.' },
                          { icon: '👶', text: 'Bless my children with wisdom and good fortune.' },
                          { icon: '🏠', text: 'Fill my home with joy, harmony and prosperity.' },
                        ].map((tpl, i) => (
                          <button
                            key={`f-${i}`}
                            onClick={() => setNewWish(tpl.text)}
                            disabled={submitting || points < WISH_COST}
                            className="text-xs px-2 py-1 bg-purple-50/70 border border-purple-200 text-purple-700 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-50"
                          >
                            {tpl.icon} {tpl.text.length > 22 ? tpl.text.slice(0, 22) + '...' : tpl.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <textarea
                    value={newWish}
                    onChange={(e) => setNewWish(e.target.value.slice(0, 200))}
                    rows={4}
                    placeholder="Write your heartfelt wish here... wealth, health, love, career... anything your heart desires ✨"
                    className="w-full px-4 py-3 border border-pink-200 rounded-2xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300 resize-none bg-white/80 placeholder-pink-300 text-pink-900 leading-relaxed text-sm"
                    disabled={submitting || points < WISH_COST}
                  />
                  <div className="text-right mt-1">
                    <span className={`text-xs font-medium ${newWish.length >= 180 ? 'text-amber-600' : 'text-pink-400'}`}>
                      {newWish.length}/200
                    </span>
                  </div>
                </div>

                <div className="mb-4 px-3 py-2 bg-white/50 rounded-xl">
                  <p className="text-xs text-pink-700">
                    💡 <strong>Spiritual Tip:</strong> Wishes written with faith are far more likely to manifest.
                  </p>
                </div>

                {points >= WISH_COST && (
                  <div className="mb-4 text-center">
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
                      ✅ Ready to seal your blessing!
                    </span>
                  </div>
                )}

                {points < WISH_COST ? (
                  <div className="text-center">
                    <p className="text-amber-700 text-sm mb-3 font-medium">
                      Need {WISH_COST - points} more coins
                    </p>
                    <Link
                      href="/user/points"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Earn Free Coins
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitWish}
                    disabled={submitting || !newWish.trim()}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 hover:shadow-xl hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-700"></span>
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Sealing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        <Star className="w-5 h-5 fill-white" />
                        Pin My Wish on the Wall
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        <button
          onClick={() => setShowTrashModal(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center z-40 group"
          title="Trash"
        >
          <Trash2 className="w-6 h-6" />
          {deletedWishes.length > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-red-500 text-xs font-bold rounded-full flex items-center justify-center shadow-md border-2 border-red-500">
              {deletedWishes.length > 9 ? '9+' : deletedWishes.length}
            </span>
          )}
        </button>
      </div>
    </SidebarLayout>
  )
}
