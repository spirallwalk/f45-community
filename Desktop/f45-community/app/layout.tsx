import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'F45 커뮤니티',
  description: 'F45 Training 회원 커뮤니티 - 운동 횟수를 기록하고 동료와 함께 성장하세요',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="pb-20">{children}</div>
        <BottomNav />
      </body>
    </html>
  )
}
