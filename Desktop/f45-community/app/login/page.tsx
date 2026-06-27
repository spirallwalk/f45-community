'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getProfileByNickname, setStoredUserId } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nickname.trim()) return

    setLoading(true)
    setError('')

    const profile = await getProfileByNickname(nickname.trim())

    if (!profile) {
      setError('닉네임을 찾을 수 없습니다. 정확한 닉네임을 입력해주세요.')
      setLoading(false)
      return
    }

    setStoredUserId(profile.id)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-f45-dark">
      <Navbar />

      <div className="flex items-center justify-center min-h-screen pt-16 px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-f45-gradient mb-4">
              <span className="font-black text-white text-xl">F45</span>
            </div>
            <h1 className="text-3xl font-black text-white">다시 오셨군요!</h1>
            <p className="text-white/50 mt-2">닉네임으로 로그인하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5">
            <div>
              <label className="label">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="가입 시 사용한 닉네임"
                className="input-field"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !nickname.trim()}
              className="btn-primary w-full text-base"
            >
              {loading ? '로그인 중...' : '로그인 →'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            아직 계정이 없나요?{' '}
            <Link href="/signup" className="text-f45-red hover:text-f45-red-light font-semibold">
              가입하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
