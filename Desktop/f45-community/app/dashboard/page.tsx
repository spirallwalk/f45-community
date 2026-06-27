'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import BadgeDisplay from '@/components/BadgeDisplay'
import WorkoutButton from '@/components/WorkoutButton'
import {
  getStoredUserId, getProfile, hasWorkedOutToday, logWorkout,
  updateTotalCount, updateProfile, uploadAvatar, getStreak, Profile
} from '@/lib/supabase'
import { getTopBadge } from '@/lib/badges'
import Link from 'next/link'

// ── 공지사항 데이터 (여기서 수정하세요) ──────────────────────────────
const NOTICES = [
  { id: 1, text: '다사오 커뮤니티 어플을 만들어봤습니다! 많은 이용과 홍보 부탁드려요!', accent: 'red' },
] as const
// ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [workedOutToday, setWorkedOutToday] = useState(false)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  // 횟수 수정
  const [editingCount, setEditingCount] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  // 닉네임 수정
  const [editingNickname, setEditingNickname] = useState(false)
  const [newNickname, setNewNickname] = useState('')
  const [nicknameSaving, setNicknameSaving] = useState(false)

  // 아바타 업로드
  const [avatarUploading, setAvatarUploading] = useState(false)

  // 공지 배너
  const [noticeIndex, setNoticeIndex] = useState(0)
  const [noticeDismissed, setNoticeDismissed] = useState(false)

  useEffect(() => {
    if (NOTICES.length <= 1 || noticeDismissed) return
    const id = setInterval(() => {
      setNoticeIndex((prev) => (prev + 1) % NOTICES.length)
    }, 4000)
    return () => clearInterval(id)
  }, [noticeDismissed])

  const loadData = useCallback(async (userId: string) => {
    const [profileData, todayStatus, streakCount] = await Promise.all([
      getProfile(userId),
      hasWorkedOutToday(userId),
      getStreak(userId),
    ])
    if (!profileData) { router.push('/login'); return }
    setProfile(profileData)
    setWorkedOutToday(todayStatus)
    setStreak(streakCount)
  }, [router])

  useEffect(() => {
    const userId = getStoredUserId()
    if (!userId) { router.push('/login'); return }
    loadData(userId).finally(() => setLoading(false))
  }, [router, loadData])

  /* ── 횟수 수정 ── */
  function startEditCount() {
    if (!profile) return
    setEditValue(String(profile.total_count))
    setEditingCount(true)
  }

  async function saveEditCount() {
    const userId = getStoredUserId()
    if (!userId || !profile) return
    const newCount = Math.max(0, parseInt(editValue, 10) || 0)
    setEditSaving(true)
    const result = await updateTotalCount(userId, newCount)
    if (result.success) {
      setProfile((prev) => prev ? { ...prev, total_count: newCount } : prev)
      setEditingCount(false)
    } else {
      alert('수정 실패: ' + result.error)
    }
    setEditSaving(false)
  }

  /* ── 닉네임 수정 ── */
  async function saveNickname() {
    const userId = getStoredUserId()
    if (!userId || !profile || !newNickname.trim()) return
    const trimmed = newNickname.trim()
    if (trimmed === profile.nickname) { setEditingNickname(false); return }
    setNicknameSaving(true)
    const result = await updateProfile(userId, { nickname: trimmed })
    if (result.success) {
      setProfile((prev) => prev ? { ...prev, nickname: trimmed } : prev)
      setEditingNickname(false)
    } else {
      alert('닉네임 수정 실패: ' + result.error)
    }
    setNicknameSaving(false)
  }

  /* ── 아바타 업로드 ── */
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const userId = getStoredUserId()
    if (!file || !userId) return

    if (file.size > 5 * 1024 * 1024) {
      alert('5MB 이하 이미지만 업로드할 수 있습니다.')
      return
    }

    setAvatarUploading(true)
    const { url, error } = await uploadAvatar(userId, file)
    if (url) {
      const result = await updateProfile(userId, { avatar_url: url })
      if (result.success) {
        setProfile((prev) => prev ? { ...prev, avatar_url: url } : prev)
      } else {
        alert('프로필 사진 저장 실패: ' + result.error)
      }
    } else {
      alert('업로드 실패: ' + error)
    }
    setAvatarUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleWorkoutComplete() {
    const userId = getStoredUserId()
    if (!userId) return
    const result = await logWorkout(userId)
    if (result.success) {
      setWorkedOutToday(true)
      setProfile((prev) => prev ? { ...prev, total_count: prev.total_count + 1 } : prev)
      setStreak((prev) => prev + 1)
    } else {
      alert(result.error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-f45-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-f45-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const topBadge = getTopBadge(profile.total_count)
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  })

  return (
    <div className="min-h-screen bg-f45-dark">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">

        {/* ── 공지 배너 ── */}
        {!noticeDismissed && NOTICES.length > 0 && (() => {
          const notice = NOTICES[noticeIndex]
          const isRed = notice.accent === 'red'
          return (
            <div className={`mb-5 rounded-2xl border px-4 py-3 flex items-center gap-3 transition-colors ${
              isRed
                ? 'bg-f45-red/10 border-f45-red/30'
                : 'bg-f45-blue/10 border-f45-blue/30'
            }`}>
              {/* 아이콘 */}
              <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                isRed ? 'bg-f45-red/20' : 'bg-f45-blue/20'
              }`}>
                📢
              </div>

              {/* 텍스트 (key로 슬라이드 애니메이션 트리거) */}
              <p
                key={noticeIndex}
                className="flex-1 text-sm font-medium text-white/90 notice-slide-in truncate"
              >
                {notice.text}
              </p>

              {/* 도트 인디케이터 */}
              {NOTICES.length > 1 && (
                <div className="flex gap-1 flex-shrink-0">
                  {NOTICES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setNoticeIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === noticeIndex
                          ? (isRed ? 'bg-f45-red w-3' : 'bg-f45-blue-light w-3')
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* 닫기 */}
              <button
                onClick={() => setNoticeDismissed(true)}
                className="flex-shrink-0 text-white/30 hover:text-white/70 transition-colors p-1 rounded-lg hover:bg-white/10"
                title="닫기"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )
        })()}

        {/* ── 프로필 헤더 ── */}
        <div className="gradient-border p-6 mb-6">
          <div className="flex items-center gap-3 sm:gap-5">

            {/* 아바타 */}
            <div className="relative flex-shrink-0 group">
              <label htmlFor="avatar-upload" className="cursor-pointer block">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="프로필 사진"
                    className="w-20 h-20 rounded-full object-cover border-2 border-white/20 group-hover:border-f45-blue transition-all"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-f45-gradient flex items-center justify-center text-3xl font-black text-white border-2 border-white/20 group-hover:border-f45-blue transition-all">
                    {topBadge ? topBadge.emoji : profile.nickname[0]?.toUpperCase()}
                  </div>
                )}
                {/* 호버 오버레이 */}
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {avatarUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
              </label>
              <input
                id="avatar-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={avatarUploading}
              />
            </div>

            {/* 닉네임 + 지점 */}
            <div className="flex-1 min-w-0">
              {editingNickname ? (
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <input
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="bg-white/10 border border-f45-blue rounded-lg px-3 py-1.5 text-white text-xl font-black focus:outline-none focus:ring-2 focus:ring-f45-blue/40 w-full max-w-[160px]"
                    maxLength={20}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveNickname()
                      if (e.key === 'Escape') setEditingNickname(false)
                    }}
                  />
                  <button
                    onClick={saveNickname}
                    disabled={nicknameSaving || !newNickname.trim()}
                    className="px-3 py-1.5 bg-f45-blue hover:bg-f45-blue-dark text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                  >
                    {nicknameSaving ? '저장 중' : '저장'}
                  </button>
                  <button
                    onClick={() => setEditingNickname(false)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/60 text-xs rounded-lg transition-all"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-black text-white">{profile.nickname}</h1>
                  {topBadge && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${topBadge.bgColor} ${topBadge.color} border ${topBadge.borderColor}`}>
                      {topBadge.emoji} {topBadge.labelKo}
                    </span>
                  )}
                  <button
                    onClick={() => { setNewNickname(profile.nickname); setEditingNickname(true) }}
                    className="p-1 rounded-md text-white/25 hover:text-white hover:bg-white/10 transition-all"
                    title="닉네임 수정"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
              <p className="text-white/50 text-sm">📍 {profile.branch_name} 지점</p>
              {avatarUploading && (
                <p className="text-f45-blue-light text-xs mt-1 animate-pulse">사진 업로드 중...</p>
              )}
            </div>

            {/* 횟수 */}
            <div className="text-right flex-shrink-0">
              {editingCount ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-24 bg-white/10 border border-f45-blue rounded-lg px-3 py-1.5 text-white text-xl font-black text-right focus:outline-none focus:ring-2 focus:ring-f45-blue/50"
                    min={0} max={9999} autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEditCount(); if (e.key === 'Escape') setEditingCount(false) }}
                  />
                  <div className="flex flex-col gap-1">
                    <button onClick={saveEditCount} disabled={editSaving}
                      className="px-2 py-1 bg-f45-blue hover:bg-f45-blue-dark text-white text-xs font-bold rounded-md transition-all disabled:opacity-50">
                      {editSaving ? '저장 중' : '저장'}
                    </button>
                    <button onClick={() => setEditingCount(false)}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white/60 text-xs rounded-md transition-all">
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-end">
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-white">{profile.total_count}</div>
                    <div className="text-white/40 text-xs">누적 수업</div>
                  </div>
                  <button onClick={startEditCount}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
                    title="횟수 수정">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 연속 출석 스트릭 ── */}
        {streak > 0 && (
          <div className="card mb-6 flex items-center gap-4">
            <span className="text-4xl select-none leading-none">
              {streak >= 30 ? '🔥🔥🔥🔥' : streak >= 14 ? '🔥🔥🔥' : streak >= 7 ? '🔥🔥' : '🔥'}
            </span>
            <div className="flex-1">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5">연속 출석</p>
              <p className="text-2xl font-black text-white leading-none">{streak}일째</p>
            </div>
            {streak >= 30 && (
              <span className="text-xs font-bold text-f45-red bg-f45-red/10 border border-f45-red/30 px-2 py-1 rounded-lg">전설!</span>
            )}
            {streak >= 14 && streak < 30 && (
              <span className="text-xs font-bold text-orange-400 bg-orange-400/10 border border-orange-400/30 px-2 py-1 rounded-lg">대단해요!</span>
            )}
            {streak >= 7 && streak < 14 && (
              <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-1 rounded-lg">훌륭해요!</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 수업 버튼 */}
          <div className="card">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-1">오늘의 수업</h2>
            <p className="text-white/30 text-xs mb-6">{today}</p>
            <div className="flex justify-center">
              <WorkoutButton hasWorkedOutToday={workedOutToday} onComplete={handleWorkoutComplete} />
            </div>
          </div>

          {/* 통계 */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center py-4">
                <div className="text-3xl font-black text-f45-red">{profile.total_count}</div>
                <div className="text-white/50 text-xs mt-1">총 수업 횟수</div>
              </div>
              <div className="card text-center py-4">
                <div className="text-3xl font-black text-f45-blue">{workedOutToday ? '1' : '0'}</div>
                <div className="text-white/50 text-xs mt-1">오늘 완료</div>
              </div>
            </div>

            {profile.last_workout_date && (
              <div className="card">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">마지막 수업</p>
                <p className="text-white font-semibold">
                  {new Date(profile.last_workout_date).toLocaleDateString('ko-KR', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
            )}

            <Link href="/ranking"
              className="card flex items-center justify-between group hover:border-f45-blue/50 transition-all">
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">랭킹 확인</p>
                <p className="text-white font-semibold">{profile.branch_name} 지점 랭킹 보기</p>
              </div>
              <svg className="w-5 h-5 text-white/30 group-hover:text-f45-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* 뱃지 */}
        <div className="card mt-6">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">뱃지 현황</h2>
          <BadgeDisplay count={profile.total_count} />
        </div>
      </div>
    </div>
  )
}
