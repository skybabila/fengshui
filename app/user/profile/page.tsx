'use client'

import { useState, useEffect } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { User, Lock, Camera, Coins, Calendar, Star, Settings, ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'

const zodiacOptions = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
const elementOptions = ['Metal', 'Wood', 'Water', 'Fire', 'Earth']

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'settings'>('profile')
  
  const [nickname, setNickname] = useState('')
  const [birthday, setBirthday] = useState('')
  const [zodiacSign, setZodiacSign] = useState('')
  const [favoriteElement, setFavoriteElement] = useState('')
  const [interests, setInterests] = useState('')
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
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

      alert('Avatar updated successfully!')
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

      alert('Profile saved successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Save failed, please try again later')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert('Please fill in all fields')
      return
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters')
      return
    }

    setSaving(true)

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
      alert('Password changed successfully!')
    } catch (error) {
      console.error('Error updating password:', error)
      alert('Password change failed')
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
          <h2 className="text-xl font-semibold text-stone-700">Loading...</h2>
        </div>
      </div>
    )
  }

  const points = profile?.points || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <a
          href="/user/dashboard"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </a>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Profile Center</h1>
            <p className="text-emerald-100">Manage your personal information and settings</p>
          </div>

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
                Personal Info
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
                Change Password
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
                Settings
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
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
                    <p className="text-xs text-stone-400 mt-1">Click camera icon to change avatar</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Nickname</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Your nickname"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Birthday</label>
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Zodiac Sign</label>
                    <select
                      value={zodiacSign}
                      onChange={(e) => setZodiacSign(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Please select</option>
                      {zodiacOptions.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Favorite Element</label>
                    <select
                      value={favoriteElement}
                      onChange={(e) => setFavoriteElement(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Please select</option>
                      {elementOptions.map(e => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Interests</label>
                  <textarea
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="e.g., Feng Shui, I Ching, meditation, yoga..."
                  />
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Coins className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="text-sm text-stone-500">My Coins</p>
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
              <div className="space-y-6">
                <div className="bg-stone-50 rounded-xl p-4 mb-6">
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
                      placeholder="Enter new password"
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
                    <div className="flex justify-between">
                      <span className="text-stone-500">Email</span>
                      <span className="text-stone-800">{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Registered</span>
                      <span className="text-stone-800">{formatDate(user?.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Role</span>
                      <span className="text-stone-800">{profile?.role === 'admin' ? 'Admin' : 'Member'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-6">
                  <h3 className="font-semibold text-stone-800 mb-4">Quick Links</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="/fortune"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                      <Star className="w-5 h-5 text-amber-500" />
                      <span className="text-stone-700">Fortune Center</span>
                    </a>
                    <a
                      href="/wish-wall"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-pink-50 transition-colors"
                    >
                      <span className="text-lg">💝</span>
                      <span className="text-stone-700">My Wishes</span>
                    </a>
                    <a
                      href="/user/points"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-amber-50 transition-colors"
                    >
                      <Coins className="w-5 h-5 text-amber-600" />
                      <span className="text-stone-700">Coin History</span>
                    </a>
                    <a
                      href="/user/prayer"
                      className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-orange-50 transition-colors"
                    >
                      <span className="text-lg">🙏</span>
                      <span className="text-stone-700">Prayer Center</span>
                    </a>
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-4">
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
  )
}
