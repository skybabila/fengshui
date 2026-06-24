import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Feng Shui Wisdom - Ancient Chinese Wisdom for Modern Living',
  description: 'Discover the ancient art of Feng Shui. Balance your space, enhance your life energy, and unlock your true potential.',
  keywords: 'feng shui, chinese wisdom, fortune, wellness, energy balance, ancient china',
  authors: [{ name: 'Feng Shui Wisdom Team' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const GA_TRACKING_ID = 'G-MXVLQJDTZ8'

  return (
    <html lang="en">
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `
        }}></script>
      </head>
      <body className={inter.className + ' bg-silk min-h-screen'}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
