'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase, setStoredUserId } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [initialCount, setInitialCount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const parsedCount = Math.max(0, parseInt(initialCount || '0', 10) || 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nickname.trim()) return

    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('profiles')
      .insert({
        nickname: nickname.trim(),
        branch_name: '다산',
        total_count: parsedCount,
      })
      .select('id')
      .single()

    if (err) {
      if (err.code === '23505') {
        setError('이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.')
      } else {
        setError('오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
      setLoading(false)
      return
    }

    setStoredUserId(data.id)
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
            <h1 className="text-3xl font-black text-white">회원 가입</h1>
            <p className="text-white/50 mt-2">닉네임만 있으면 바로 시작할 수 있어요</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5">
            {/* Nickname */}
            <div>
              <label className="label">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 철인왕자, 운동왕김씨"
                className="input-field"
                maxLength={20}
                required
              />
              <p className="text-white/30 text-xs mt-1">{nickname.length}/20자</p>
            </div>

            {/* Initial count */}
            <div>
              <label className="label">이전 수업 횟수 (선택)</label>
              <div className="relative">
                <input
                  type="number"
                  value={initialCount}
                  onChange={(e) => setInitialCount(e.target.value)}
                  placeholder="0"
                  className="input-field pr-10"
                  min={0}
                  max={9999}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">회</span>
              </div>
              <p className="text-white/30 text-xs mt-1">
                이미 수업을 들으셨다면 누적 횟수를 입력하세요 (예: 130)
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !nickname.trim()}
              className="btn-primary w-full text-base"
            >
              {loading ? '가입 중...' : '🔥 시작하기'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            이미 계정이 있나요?{' '}
            <Link href="/login" className="text-f45-blue hover:text-f45-blue-light font-semibold">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
