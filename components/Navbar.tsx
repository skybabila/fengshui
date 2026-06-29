'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase, ADMIN_EMAIL } from '@/lib/supabase'
import { VERSION } from '@/lib/version'
import { BarChart3, FileText } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (cancelled) return
        if (user) {
          setIsLoggedIn(true)
          setIsAdmin(user.email === ADMIN_EMAIL)
        }
      } catch {
        setIsLoggedIn(false)
        setIsAdmin(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (cancelled) return
        if (session?.user) {
          setIsLoggedIn(true)
          setIsAdmin(session.user.email === ADMIN_EMAIL)
        } else {
          setIsLoggedIn(false)
          setIsAdmin(false)
        }
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsMenuOpen(false)
    window.location.href = '/'
  }

  const primaryHref = isAdmin ? '/admin/dashboard' : '/user/dashboard'
  const primaryLabel = isAdmin ? 'Admin Panel' : 'Dashboard'

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <span className="text-lg text-white">☯</span>
            </div>
            <span className="text-xl font-bold text-stone-800">Feng Shui Wisdom</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <div className="mr-4 px-3 py-2 text-xs font-mono text-stone-400 border border-stone-200 rounded-full">v{VERSION}</div>
            <Link href="/" className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">Home</Link>
            <Link href="/articles" className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">Articles</Link>
            {isLoggedIn && (
              <>
                <Link href="/fortune" className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">Energy</Link>
                <Link href="/user/prayer" className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">Temple</Link>
              </>
            )}

            <div className="ml-2 flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin/analytics"
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-stone-500 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                        title="Analytics"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span className="hidden lg:inline">Analytics</span>
                      </Link>
                      <Link
                        href="/admin/articles"
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-stone-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        title="Articles"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="hidden lg:inline">Articles</span>
                      </Link>
                    </>
                  )}
                  <Link
                    href={primaryHref}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 ${
                      isAdmin
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
                    }`}
                  >
                    {primaryLabel}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-200 transition-all hover:-translate-y-0.5"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <div className="px-3 py-1 text-xs font-mono text-stone-400 border border-stone-200 rounded-full">v{VERSION}</div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-stone-700 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-emerald-100 animate-fade-in-down">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-emerald-50">Home</Link>
            <Link href="/articles" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-emerald-50">Articles</Link>
            {isLoggedIn && (
              <>
                <Link href="/fortune" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-emerald-50">Energy Forecast</Link>
                <Link href="/user/prayer" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-emerald-50">Temple Worship</Link>
              </>
            )}

            <div className="pt-3 mt-2 border-t border-emerald-100 space-y-2">
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <>
                      <Link href="/admin/analytics" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-cyan-50">
                        <BarChart3 className="w-4 h-4" /> Analytics
                      </Link>
                      <Link href="/admin/articles" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-purple-50">
                        <FileText className="w-4 h-4" /> Manage Articles
                      </Link>
                    </>
                  )}
                  <Link href={primaryHref} onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold text-center text-white bg-gradient-to-r from-emerald-600 to-teal-600">
                    {primaryLabel}
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-semibold text-center text-white bg-gradient-to-r from-emerald-600 to-teal-600">
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
