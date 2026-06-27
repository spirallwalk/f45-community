'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { clearStoredUserId, getStoredUserId } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!getStoredUserId())
    setMenuOpen(false)
  }, [pathname])

  function handleLogout() {
    clearStoredUserId()
    setMenuOpen(false)
    router.push('/')
  }

  const navLinks = isLoggedIn
    ? [
        { href: '/dashboard', label: '대시보드' },
        { href: '/community', label: '커뮤니티' },
        { href: '/ranking', label: '랭킹' },
        // { href: '/map', label: '지도' }, // 지도 탭 임시 비활성화
      ]
    : [
        { href: '/community', label: '커뮤니티' },
        { href: '/ranking', label: '랭킹' },
        // { href: '/map', label: '지도' }, // 지도 탭 임시 비활성화
      ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-f45-dark/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-f45-gradient flex items-center justify-center font-black text-sm text-white">
              F45
            </div>
            <span className="font-black text-white tracking-wider text-lg uppercase">
              F45<span className="text-f45-red">Community</span>
            </span>
          </Link>

          {/* 데스크탑 네비게이션 */}
          <div className="hidden sm:flex items-center gap-2">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  pathname === href
                    ? 'bg-f45-blue text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </Link>
            ))}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                로그아웃
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-f45-red hover:bg-f45-red-dark text-white transition-all"
                >
                  가입하기
                </Link>
              </>
            )}
          </div>

          {/* 모바일 햄버거 버튼 */}
          <button
            className="sm:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/10 bg-f45-dark/95 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 py-2 space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  pathname === href
                    ? 'bg-f45-blue text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </Link>
            ))}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                로그아웃
              </button>
            ) : (
              <div className="flex gap-2 py-1">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-semibold bg-f45-red hover:bg-f45-red-dark text-white transition-all"
                >
                  가입하기
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
