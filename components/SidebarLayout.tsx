'use client'

import Sidebar from './Sidebar'

interface SidebarLayoutProps {
  children: React.ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar />
      <main className="ml-64">
        {children}
      </main>
    </div>
  )
}