'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { User, Lock, Camera, Coins, Calendar, Star, Settings, ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'

const zodiacOptions = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const elementOptions = ['金', '木', '水', '火', '土']

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'settings'>('profile')
  
  // 表单数据
  const [nickname, setNickname] = useState('')
  const [birthday, setBirthday] = useState('')
  const [zodiacSign, setZodiacSign] = useState('')
  const [favoriteElement, setFavoriteElement] = useState('')
  const [interests, setInterests] = useState('')
  
  // 密码修改
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  // 头像上传
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

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
        
        // 初始化表单数据
        setNickname(userProfile?.nickname || userProfile?.name || '')
        setBirthday(userProfile?.birthday || '')
        setZodiacSign(userProfile?.zodiac_sign || '')
        setFavoriteElement(userProfile?.favorite_element || '')
        setInterests(userProfile?.interests || '')
        setAvatarUrl(userProfile?.avatar_url || '')
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }

    // 检查文件大小 (最大 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB')
      return
    }

    setUploadingAvatar(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('头像上传失败，请稍后再试')
        return
      }

      // 获取公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)

      // 更新用户头像
      await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)

      alert('头像更新成功！')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('头像上传失败')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)

    try {
      await supabase
        .from('user_profiles')
        .update({
          nickname,
          birthday,
          zodiac_sign: zodiacSign,
          favorite_element: favoriteElement,
          interests,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)

      alert('个人信息保存成功！')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('保存失败，请稍后再试')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert('请填写完整信息')
      return
    }

    if (newPassword.length < 6) {
      alert('新密码至少需要6个字符')
      return
    }

    setSaving(true)

    try {
      // 先验证当前密码
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        alert('当前密码不正确')
        return
      }

      // 更新密码
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        alert(updateError.message)
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      alert('密码修改成功！')
    } catch (error) {
      console.error('Error updating password:', error)
      alert('密码修改失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-2xl">☯</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-700">加载中...</h2>
        </div>
      </div>
    )
  }

  const points = profile?.points || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 返回按钮 */}
        <a
          href="/user/dashboard"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回 Dashboard
        </a>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">个人中心</h1>
            <p className="text-emerald-100">管理您的个人信息和设置</p>
          </div>

          {/* 标签页 */}
          <div className="border-b border-stone-200">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-2 font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                个人信息
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-2 font-medium transition-colors ${
                  activeTab === 'password'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                修改密码
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-2 font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                设置
              </button>
            </div>
          </div>

          {/* 内容区 */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* 头像 */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="头像"
                        className="w-20 h-20 rounded-full object-cover border-2 border-emerald-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border-2 border-emerald-200">
                        <User className="w-8 h-8 text-emerald-600" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg">
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                        <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-stone-800">{nickname || user?.email?.split('@')[0]}</p>
                    <p className="text-sm text-stone-500">{user?.email}</p>
                    <p className="text-xs text-stone-400 mt-1">点击相机图标更换头像</p>
                  </div>
                </div>

                {/* 基本信息 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">昵称</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="您的昵称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">生日</label>
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">生肖</label>
                    <select
                      value={zodiacSign}
                      onChange={(e) => setZodiacSign(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">请选择</option>
                      {zodiacOptions.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">喜欢的五行</label>
                    <select
                      value={favoriteElement}
                      onChange={(e) => setFavoriteElement(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">请选择</option>
                      {elementOptions.map(e => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">兴趣爱好</label>
                  <textarea
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="例如：风水、易经、冥想、瑜伽..."
                  />
                </div>

                {/* 元宝信息 */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Coins className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="text-sm text-stone-500">我的元宝</p>
                      <p className="text-xl font-bold text-amber-600">{points}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      保存中...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Save className="w-5 h-5" />
                      保存个人信息
                    </span>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-6">
                <div className="bg-stone-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-stone-600">
                    请输入当前密码和新密码来修改您的登录密码。新密码至少需要6个字符。
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">当前密码</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="输入当前密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">新密码</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="输入新密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleUpdatePassword}
                  disabled={saving || !currentPassword || !newPassword}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      修改中...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5" />
                      修改密码
                    </span>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-stone-50 rounded-xl p-6">
                  <h3 className="font-semibold text-stone-800 mb-4">账户信息</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-500">邮箱</span>
                      <span className="text-stone-800">{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">注册时间</span>
                      <span className="text-stone-800">{formatDate(user?.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">角色</span>
                      <span className="text-stone-800">{profile?.role === 'admin' ? '管理员' : '会员'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-6">
                  <h3 className="font-semibold text-stone-800 mb-4">快捷入口</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="/fortune"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                      <Star className="w-5 h-5 text-amber-500" />
                      <span className="text-stone-700">运势中心</span>
                    </a>
                    <a
                      href="/wish-wall"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-pink-50 transition-colors"
                    >
                      <span className="text-lg">💝</span>
                      <span className="text-stone-700">我的许愿</span>
                    </a>
                    <a
                      href="/user/points"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-amber-50 transition-colors"
                    >
                      <Coins className="w-5 h-5 text-amber-600" />
                      <span className="text-stone-700">元宝明细</span>
                    </a>
                    <a
                      href="/user/prayer"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-orange-50 transition-colors"
                    >
                      <span className="text-lg">🙏</span>
                      <span className="text-stone-700">祈福中心</span>
                    </a>
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-sm text-red-600">
                    如需注销账户或有其他问题，请联系管理员。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}