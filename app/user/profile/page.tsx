'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import SidebarLayout from '@/components/SidebarLayout'
import { User, Lock, Camera, Coins, Star, Settings, Save, Eye, EyeOff, Sparkles, Gem, Flame, Droplets, Leaf, Mountain } from 'lucide-react'

const zodiacAnimals = [
  { name: 'Rat', emoji: '🐀', chinese: '鼠' },
  { name: 'Ox', emoji: '🐂', chinese: '牛' },
  { name: 'Tiger', emoji: '🐅', chinese: '虎' },
  { name: 'Rabbit', emoji: '🐇', chinese: '兔' },
  { name: 'Dragon', emoji: '🐉', chinese: '龙' },
  { name: 'Snake', emoji: '🐍', chinese: '蛇' },
  { name: 'Horse', emoji: '🐴', chinese: '马' },
  { name: 'Goat', emoji: '🐐', chinese: '羊' },
  { name: 'Monkey', emoji: '🐒', chinese: '猴' },
  { name: 'Rooster', emoji: '🐓', chinese: '鸡' },
  { name: 'Dog', emoji: '🐕', chinese: '狗' },
  { name: 'Pig', emoji: '🐖', chinese: '猪' },
]

const fiveElements = [
  { name: 'Metal', chinese: '金', emoji: '⚔️', icon: Gem, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', gradient: 'from-amber-400 to-yellow-500' },
  { name: 'Water', chinese: '水', emoji: '💧', icon: Droplets, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', gradient: 'from-blue-400 to-cyan-500' },
  { name: 'Wood', chinese: '木', emoji: '🌿', icon: Leaf, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', gradient: 'from-emerald-400 to-green-500' },
  { name: 'Fire', chinese: '火', emoji: '🔥', icon: Flame, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', gradient: 'from-red-400 to-orange-500' },
  { name: 'Earth', chinese: '土', emoji: '⛰️', icon: Mountain, color: 'text-stone-600', bgColor: 'bg-stone-50', borderColor: 'border-stone-200', gradient: 'from-stone-400 to-amber-600' },
]

function getZodiacFromBirthday(birthday: string): typeof zodiacAnimals[0] | null {
  if (!birthday) return null
  const year = new Date(birthday).getFullYear()
  if (isNaN(year)) return null
  const index = ((year - 1900) % 12 + 12) % 12
  return zodiacAnimals[index]
}

function getElementFromBirthday(birthday: string): typeof fiveElements[0] | null {
  if (!birthday) return null
  const year = new Date(birthday).getFullYear()
  if (isNaN(year) || year < 1900) return null
  const lastDigit = year % 10
  const elementMap: Record<number, number> = {
    0: 0, 1: 0,
    2: 1, 3: 1,
    4: 2, 5: 2,
    6: 3, 7: 3,
    8: 4, 9: 4,
  }
  return fiveElements[elementMap[lastDigit]]
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'settings'>('profile')
  
  const [nickname, setNickname] = useState('')
  const [birthday, setBirthday] = useState('')
  const [interests, setInterests] = useState('')
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const maxDate = new Date().toISOString().split('T')[0]

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
        
        setNickname(userProfile?.nickname || userProfile?.name || '')
        setBirthday(userProfile?.birthday || '')
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

  const zodiac = getZodiacFromBirthday(birthday)
  const element = getElementFromBirthday(birthday)

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size cannot exceed 2MB')
      return
    }

    setUploadingAvatar(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('Avatar upload failed, please try again later')
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)

      await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)

      showSuccess('Avatar updated successfully!')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Avatar upload failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)
    setSuccessMessage('')

    try {
      const zodiacSign = zodiac?.name || null
      const elementName = element?.name || null
      
      const updateData: any = {
        nickname: nickname.trim() || null,
        birthday: birthday || null,
        zodiac_sign: zodiacSign,
        favorite_element: elementName,
        interests: interests.trim() || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id)

      if (error) {
        console.error('Update error:', error)
        alert('Save failed: ' + error.message)
        return
      }

      const updatedProfile = await getUserProfile(user.id)
      setProfile(updatedProfile)

      showSuccess('Profile saved successfully!')
    } catch (error: any) {
      console.error('Error saving profile:', error)
      alert('Save failed: ' + (error?.message || 'Please try again later'))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!user || !currentPassword || !newPassword) {
      alert('Please fill in all fields')
      return
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters')
      return
    }

    setSaving(true)
    setSuccessMessage('')

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        alert('Current password is incorrect')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        alert(updateError.message)
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      showSuccess('Password changed successfully!')
    } catch (error: any) {
      console.error('Error updating password:', error)
      alert('Password change failed: ' + (error?.message || ''))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <span className="text-2xl">☯</span>
            </div>
            <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  const points = profile?.points || 0

  return (
    <SidebarLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">

          {successMessage && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-medium flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {successMessage}
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Profile & Destiny Settings</h1>
            <p className="text-stone-500">Fill in your info to calculate your zodiac sign and life element</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm text-stone-500">My Coins</p>
              <p className="text-xl font-bold text-amber-600">{points.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">{zodiac?.emoji || '✨'}</span>
              </div>
              <p className="text-sm text-stone-500">Your Zodiac Sign</p>
              <p className="text-lg font-bold text-stone-800">{zodiac?.chinese || '-'}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100 text-center">
              <div className={`w-10 h-10 bg-gradient-to-br ${element ? element.gradient : 'from-stone-100 to-stone-200'} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <span className="text-lg">{element?.emoji || '☯️'}</span>
              </div>
              <p className="text-sm text-stone-500">Life Element (Destiny)</p>
              <p className="text-lg font-bold text-stone-800">{element?.chinese || '-'}</p>
            </div>
          </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">

          <div className="border-b border-stone-200">
            <div className="flex gap-4 px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Personal Info
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'password'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Change Password
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 flex items-center justify-center border-2 border-white shadow-md">
                        <User className="w-10 h-10 text-white" />
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
                    <p className="font-bold text-stone-800 text-lg">{nickname || user?.email?.split('@')[0]}</p>
                    <p className="text-sm text-stone-500">{user?.email}</p>
                    <p className="text-xs text-emerald-600 mt-1">📷 Click camera to change avatar</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Nickname</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={30}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Your nickname"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Birthday</label>
                    <input
                      type="date"
                      value={birthday}
                      min="1900-01-01"
                      max={maxDate}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val) {
                          const year = parseInt(val.split('-')[0])
                          if (year >= 1900 && year <= new Date().getFullYear()) {
                            setBirthday(val)
                          }
                        } else {
                          setBirthday('')
                        }
                      }}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <p className="text-xs text-stone-400 mt-1">Enter your birth date to generate your zodiac and life element</p>
                  </div>
                </div>

                {/* Zodiac & Life Element */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`p-5 rounded-xl border-2 ${zodiac ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200' : 'bg-stone-50 border-stone-200'}`}>
                    <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-500" />
                      Your Zodiac Sign
                    </h3>
                    {zodiac ? (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-4xl">
                          {zodiac.emoji}
                        </div>
                        <div>
                          <p className="font-bold text-xl text-stone-800">{zodiac.name}</p>
                          <p className="text-stone-500">{zodiac.chinese} 生肖</p>
                          <p className="text-xs text-pink-600 mt-1">Calculated from birth year</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-stone-400">
                        <div className="w-16 h-16 bg-stone-100 rounded-xl flex items-center justify-center text-2xl">
                          ❓
                        </div>
                        <p className="text-sm">Input birthday to view your animal sign & yearly luck</p>
                      </div>
                    )}
                  </div>

                  <div className={`p-5 rounded-xl border-2 ${element ? `bg-gradient-to-br ${element.bgColor} ${element.borderColor}` : 'bg-stone-50 border-stone-200'}`}>
                    <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
                      <Gem className={`w-4 h-4 ${element ? element.color : 'text-stone-400'}`} />
                      Life Element (Destiny)
                    </h3>
                    {element ? (
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${element.gradient} rounded-xl shadow-sm flex items-center justify-center text-3xl`}>
                          {element.emoji}
                        </div>
                        <div>
                          <p className="font-bold text-xl text-stone-800">{element.name}</p>
                          <p className="text-stone-500">{element.chinese} 命格</p>
                          <p className="text-xs text-emerald-600 mt-1">Based on birth year</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-stone-400">
                        <div className="w-16 h-16 bg-stone-100 rounded-xl flex items-center justify-center text-2xl">
                          ☯️
                        </div>
                        <p className="text-sm">Calculate your core five-element energy based on your birth info</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Interests</label>
                  <textarea
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="e.g. Feng Shui, horoscope reading, home layout, wellness…"
                  />
                  <p className="text-xs text-stone-400 mt-1 text-right">{interests.length}/500</p>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                  <div className="flex items-center justify-center gap-3">
                    <Coins className="w-6 h-6 text-amber-600" />
                    <p className="text-lg font-semibold text-amber-800">Complete your full profile → Claim +100 Free Coins</p>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Save className="w-5 h-5" />
                      Save Profile
                    </span>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-6 max-w-md mx-auto">
                <div className="bg-stone-50 rounded-xl p-4">
                  <p className="text-sm text-stone-600">
                    Please enter your current password and new password to change your login password. New password must be at least 6 characters.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter current password"
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
                  <label className="block text-sm font-medium text-stone-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter new password (min 6 chars)"
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
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Changing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5" />
                      Change Password
                    </span>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-stone-50 rounded-xl p-6">
                  <h3 className="font-semibold text-stone-800 mb-4">Account Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Email</span>
                      <span className="text-stone-800 font-medium">{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Role</span>
                      <span className={`font-medium ${profile?.role === 'admin' ? 'text-emerald-600' : 'text-stone-800'}`}>
                        {profile?.role === 'admin' ? '👑 Admin' : 'Member'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Member since</span>
                      <span className="text-stone-800">{user?.created_at ? formatDate(user.created_at) : '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-6">
                  <h3 className="font-semibold text-stone-800 mb-4">Quick Links</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="/fortune"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-amber-50 transition-colors border border-stone-100"
                    >
                      <Star className="w-5 h-5 text-amber-500" />
                      <span className="text-stone-700 text-sm">Fortune Center</span>
                    </a>
                    <a
                      href="/wish-wall"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-pink-50 transition-colors border border-stone-100"
                    >
                      <span className="text-lg">💝</span>
                      <span className="text-stone-700 text-sm">My Wishes</span>
                    </a>
                    <a
                      href="/user/points"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-amber-50 transition-colors border border-stone-100"
                    >
                      <Coins className="w-5 h-5 text-amber-600" />
                      <span className="text-stone-700 text-sm">Coin History</span>
                    </a>
                    <a
                      href="/user/prayer"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-orange-50 transition-colors border border-stone-100"
                    >
                      <span className="text-lg">🙏</span>
                      <span className="text-stone-700 text-sm">Prayer Center</span>
                    </a>
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <p className="text-sm text-red-600">
                    To delete your account or for other issues, please contact the administrator.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
