import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-stone-800 text-stone-300 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-lg text-white">☯</span>
              </div>
              <span className="text-xl font-bold text-white">Feng Shui Wisdom</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Ancient Chinese wisdom for modern living. Discover the art of balancing your space and life energy.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-stone-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/articles" className="text-sm text-stone-400 hover:text-white transition-colors">Articles</Link></li>
              <li><Link href="/daily-fortune" className="text-sm text-stone-400 hover:text-white transition-colors">Daily Fortune</Link></li>
              <li><Link href="/wish-wall" className="text-sm text-stone-400 hover:text-white transition-colors">Wish Wall</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Members</h3>
            <ul className="space-y-2">
              <li><Link href="/user/dashboard" className="text-sm text-stone-400 hover:text-white transition-colors">Member Dashboard</Link></li>
              <li><Link href="/user/prayer" className="text-sm text-stone-400 hover:text-white transition-colors">Temple Prayer</Link></li>
              <li><Link href="/user/points" className="text-sm text-stone-400 hover:text-white transition-colors">Merit Points</Link></li>
              <li><Link href="/user/settings" className="text-sm text-stone-400 hover:text-white transition-colors">Account Settings</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li><Link href="/articles" className="text-sm text-stone-400 hover:text-white transition-colors">Feng Shui Guides</Link></li>
              <li><Link href="/articles" className="text-sm text-stone-400 hover:text-white transition-colors">Daily Energy</Link></li>
              <li><Link href="/articles" className="text-sm text-stone-400 hover:text-white transition-colors">Personal Growth</Link></li>
              <li><Link href="/articles" className="text-sm text-stone-400 hover:text-white transition-colors">Wellness</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-700 text-center text-sm text-stone-500">
          <p>© 2026 Feng Shui Wisdom. All rights reserved.</p>
          <p className="mt-2">For entertainment and wellness guidance only.</p>
        </div>
      </div>
    </footer>
  )
}
