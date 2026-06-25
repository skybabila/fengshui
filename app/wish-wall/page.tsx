'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Heart, Send, Sparkles, Lock, Coins, Trash2 } from 'lucide-react'

const WISH_COST = 10 // 每次许愿消耗10元宝

export default function WishWallPage() {
  const [wishes, setWishes] = useState<any[]>([])
  const [newWish, setNewWish] = useState('')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          window.location.href = '/login'
          return
        }
        setUser(authUser)
        const userProfile = await getUserProfile(authUser.id)
        setProfile(userProfile)

        // 只获取当前用户的许愿
        const { data: wishData } = await supabase
          .from('wishes')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(50)
        
        setWishes(wishData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePostWish = async () => {
    if (!newWish.trim() || !user) {
      if (!user) {
        alert('请登录后再许愿')
      }
      return
    }

    if (newWish.length > 200) {
      alert('愿望内容过长，请保持在200字符以内')
      return
    }

    const points = profile?.points || 0
    if (points < WISH_COST) {
      alert(`元宝不足！许愿需要 ${WISH_COST} 元宝，您当前有 ${points} 元宝`)
      return
    }

    setPosting(true)

    try {
      // 扣除元宝
      await supabase
        .from('user_profiles')
        .update({ points: points - WISH_COST })
        .eq('id', user.id)

      // 记录元宝交易
      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          description: '许愿消耗',
          points: -WISH_COST
        })

      const { data: newWishData } = await supabase
        .from('wishes')
        .insert({
          user_id: user.id,
          content: newWish.trim(),
          is_public: false, // 改为私有
        })
        .select()
        .single()

      if (newWishData) {
        setWishes([newWishData, ...wishes])
        setNewWish('')
        // 更新用户元宝
        const updatedProfile = await getUserProfile(user.id)
        setProfile(updatedProfile)
      }
    } catch (error) {
      console.error('Error posting wish:', error)
      alert('许愿失败，请稍后再试')
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteWish = async (wishId: number) => {
    if (!confirm('确定要删除这条愿望吗？')) return
    
    try {
      await supabase
        .from('wishes')
        .delete()
        .eq('id', wishId)
      
      setWishes(wishes.filter(w => w.id !== wishId))
    } catch (error) {
      console.error('Error deleting wish:', error)
      alert('删除失败')
    }
  }

  const getRandomColor = () => {
    const colors = [
      'from-pink-100 to-rose-100 border-pink-200',
      'from-purple-100 to-violet-100 border-purple-200',
      'from-blue-100 to-cyan-100 border-blue-200',
      'from-emerald-100 to-teal-100 border-emerald-200',
      'from-amber-100 to-orange-100 border-amber-200',
      'from-red-100 to-pink-100 border-red-200',
      'from-indigo-100 to-purple-100 border-indigo-200',
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">我的许愿墙</h1>
          <p className="text-stone-500">记录您的美好愿望，让心灵得到慰藉</p>
        </div>

        {/* 元宝显示 */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">我的元宝</p>
              <p className="text-xl font-bold text-amber-600">{profile?.points || 0}</p>
            </div>
          </div>
          <div className="text-sm text-stone-500">
            许愿消耗：<span className="text-amber-600 font-semibold">{WISH_COST} 元宝</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">许下新愿望</h2>
          {user ? (
            <>
              <textarea
                value={newWish}
                onChange={(e) => setNewWish(e.target.value)}
                placeholder="写下您的愿望... (最多200字符)"
                maxLength={200}
                className="w-full p-4 border border-stone-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none h-32"
              />
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-stone-400">{newWish.length}/200</span>
                <button
                  onClick={handlePostWish}
                  disabled={!newWish.trim() || posting || (profile?.points || 0) < WISH_COST}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {posting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      许愿中...
                    </span>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      许愿 ({WISH_COST}元宝)
                    </>
                  )}
                </button>
              </div>
              {(profile?.points || 0) < WISH_COST && (
                <p className="mt-3 text-sm text-red-500">
                  元宝不足，无法许愿。请前往个人中心查看如何获取元宝。
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 bg-stone-50 rounded-xl">
              <Lock className="w-12 h-12 text-stone-400 mb-4" />
              <p className="text-stone-500 mb-2">请登录后许愿</p>
              <a href="/login" className="text-pink-600 font-medium hover:underline">
                登录 / 注册
              </a>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-stone-600">已许下 {wishes.length} 个愿望</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishes.map((wish: any, index) => (
            <div
              key={wish.id}
              className={`bg-gradient-to-br ${getRandomColor()} border rounded-xl p-5 shadow-sm hover:shadow-md transition-all animate-fade-in-up relative`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                onClick={() => handleDeleteWish(wish.id)}
                className="absolute top-2 right-2 p-1.5 text-stone-400 hover:text-red-500 hover:bg-white/50 rounded-lg transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <p className="text-stone-700 mb-3 pr-6">{wish.content}</p>
              <div className="flex items-center justify-between text-sm text-stone-500">
                <span>
                  {profile?.nickname || profile?.name || user?.email?.split('@')[0] || '我'}
                </span>
                <span>{formatDate(wish.created_at)}</span>
              </div>
            </div>
          ))}
        </div>

        {wishes.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">还没有许下任何愿望，开始您的第一个愿望吧！</p>
          </div>
        )}
      </div>
    </div>
  )
}
