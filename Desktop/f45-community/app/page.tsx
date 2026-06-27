import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { BADGES } from '@/lib/badges'

export default function Home() {
  return (
    <div className="min-h-screen bg-f45-dark">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,61,165,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,61,165,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-f45-blue/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-f45-red/20 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Logo badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
            <div className="w-6 h-6 rounded bg-f45-gradient flex items-center justify-center text-xs font-black text-white">
              F45
            </div>
            <span className="text-white/70 text-sm font-medium">회원 커뮤니티</span>
          </div>

          <h1 className="text-6xl sm:text-8xl font-black text-white mb-4 tracking-tight leading-none">
            TRAIN
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-f45-blue to-f45-red">
              TOGETHER
            </span>
          </h1>

          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            F45 수업 횟수를 기록하고, 뱃지를 달성하고,<br />
            지점 동료들과 함께 성장하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-f45-red hover:bg-f45-red-dark text-white font-black text-lg rounded-xl transition-all active:scale-95 red-glow"
            >
              지금 시작하기 →
            </Link>
            <Link
              href="/ranking"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg rounded-xl transition-all"
            >
              랭킹 보기
            </Link>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              { value: '45', label: '최소 수업 목표' },
              { value: '4', label: '뱃지 레벨' },
              { value: '∞', label: '함께하는 회원' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-white/40 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <span className="text-xs">스크롤</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Badge Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-3">뱃지 달성 시스템</h2>
            <p className="text-white/50">수업 횟수에 따라 자동으로 뱃지가 달성됩니다</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BADGES.map((badge) => (
              <div
                key={badge.target}
                className={`${badge.bgColor} border ${badge.borderColor} rounded-2xl p-6 text-center transition-all hover:scale-105`}
              >
                <div className="text-5xl mb-3">{badge.emoji}</div>
                <div className={`text-3xl font-black ${badge.color} mb-1`}>{badge.target}</div>
                <div className="text-white/50 text-sm">회 달성</div>
                <div className={`text-xs font-semibold mt-2 ${badge.color}`}>{badge.labelKo}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="gradient-border p-8 sm:p-12 text-center">
            <h2 className="text-4xl font-black text-white mb-4">
              오늘부터 시작하세요
            </h2>
            <p className="text-white/60 mb-8 text-lg">
              닉네임과 지점명만 있으면 바로 가입 가능합니다.
            </p>
            <Link
              href="/signup"
              className="inline-block px-10 py-4 bg-f45-red hover:bg-f45-red-dark text-white font-black text-xl rounded-xl transition-all active:scale-95 red-glow"
            >
              무료 가입하기 🔥
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 text-center">
        <p className="text-white/30 text-sm">
          © 2024 F45 커뮤니티 · 공식 F45 Training과 무관한 팬 커뮤니티입니다
        </p>
      </footer>
    </div>
  )
}
