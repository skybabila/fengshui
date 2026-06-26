'use client'

import Sidebar from './Sidebar'
import Navbar from './Navbar'

interface SidebarLayoutProps {
  children: React.ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <Sidebar />
      <main className="ml-64 pt-16">
        {children}
      </main>
    </div>
  )
}