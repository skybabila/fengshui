'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase, ADMIN_EMAIL, getUserProfile } from '@/lib/supabase'
import {
  LayoutDashboard, Users, FileText, Activity, Star, Heart,
  Coins, Settings, LogOut, Calendar, Sparkles, Home, BookOpen,
  MessageCircle
} from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  href: string
  icon: any
  section: 'admin' | 'user' | 'fortune' | 'public'
}

const adminMenu: MenuItem[] = [
  { id: 'admin-dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, section: 'admin' },
  { id: 'admin-users', label: 'Manage Users', href: '/admin/users', icon: Users, section: 'admin' },
  { id: 'admin-articles', label: 'Content Management', href: '/admin/articles', icon: FileText, section: 'admin' },
  { id: 'admin-analytics', label: 'Analytics', href: '/admin/analytics', icon: Activity, section: 'admin' },
]

const userMenu: MenuItem[] = [
  { id: 'user-dashboard', label: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard, section: 'user' },
  { id: 'user-fortune', label: 'Fortune Center', href: '/fortune', icon: Sparkles, section: 'fortune' },
  { id: 'user-prayer', label: 'Prayer Center', href: '/user/prayer', icon: MessageCircle, section: 'user' },
  { id: 'user-wishes', label: 'Wish Wall', href: '/wish-wall', icon: Heart, section: 'user' },
  { id: 'user-points', label: 'Coin History', href: '/user/points', icon: Coins, section: 'user' },
  { id: 'user-profile', label: 'Profile Settings', href: '/user/profile', icon: Settings, section: 'user' },
]

const publicMenu: MenuItem[] = [
  { id: 'home', label: 'Home', href: '/', icon: Home, section: 'public' },
  { id: 'articles', label: 'Articles', href: '/articles', icon: BookOpen, section: 'public' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [points, setPoints] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setIsLoggedIn(true)
          setIsAdmin(user.email === ADMIN_EMAIL)
          const profile = await getUserProfile(user.id)
          setPoints(profile?.points || 0)
        }
      } catch {
        setIsLoggedIn(false)
        setIsAdmin(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const getMenuItems = () => {
    if (isAdmin) {
      return [...publicMenu, ...adminMenu]
    }
    if (isLoggedIn) {
      return [...publicMenu, ...userMenu]
    }
    return publicMenu
  }

  const menuItems = getMenuItems()

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true
    if (href !== '/' && pathname.startsWith(href)) return true
    return false
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-stone-200 z-40 flex flex-col transition-all duration-300 shadow-lg ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-stone-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 flex-shrink-0">
            <span className="text-lg text-white">☯</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-stone-800 whitespace-nowrap">Feng Shui</span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {isLoggedIn && !collapsed && (
          <div className="px-4 mb-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Coins className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-500">My Coins</p>
                  <p className="font-bold text-amber-600">{points.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoggedIn && !collapsed && (
          <div className="px-4 mb-2">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Public</p>
          </div>
        )}

        {menuItems.filter(item => item.section === 'public').map(item => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all ${
              isActive(item.href)
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
            }`}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href) ? 'text-emerald-600' : 'text-stone-400'}`} />
            {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}

        {isLoggedIn && (
          <>
            {!collapsed && (
              <div className="px-4 mb-2 mt-4">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  {isAdmin ? 'Admin Panel' : 'Member Center'}
                </p>
              </div>
            )}

            {menuItems.filter(item => item.section === (isAdmin ? 'admin' : 'user')).map(item => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all ${
                  isActive(item.href)
                    ? isAdmin
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${
                  isActive(item.href)
                    ? isAdmin ? 'text-amber-600' : 'text-emerald-600'
                    : 'text-stone-400'
                }`} />
                {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </Link>
            ))}

            {!isAdmin && !collapsed && (
              <div className="px-4 mb-2 mt-4">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Fortune</p>
              </div>
            )}

            {menuItems.filter(item => item.section === 'fortune').map(item => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all ${
                  isActive(item.href)
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${
                  isActive(item.href) ? 'text-amber-600' : 'text-stone-400'
                }`} />
                {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </Link>
            ))}
          </>
        )}
      </div>

      <div className="p-4 border-t border-stone-100">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all text-red-600 hover:bg-red-50 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Sign Out</span>}
          </button>
        ) : (
          <Link
            href="/login"
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Sign In</span>}
          </Link>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 mt-2 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <svg className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </aside>
  )
}