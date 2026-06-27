'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import {
  getAllProfiles, getMonthlyWorkoutCounts, getDailyWorkoutCounts,
  getStoredUserId, Profile
} from '@/lib/supabase'
import { getTopBadge } from '@/lib/badges'

type Tab = 'daily' | 'monthly' | 'total'
type Entry = { profile: Profile; count: number }

function daysLeftInMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()
}

/* ── 원형 아바타 ── */
function AvatarCircle({
  profile, size = 52, ring,
}: {
  profile: Profile
  size?: number
  ring?: string
}) {
  const badge = getTopBadge(profile.total_count)
  const initial = profile.nickname[0]?.toUpperCase() ?? '?'
  return (
    <div
      className="rounded-full overflow-hidden flex-shrink-0"
      style={{
        width: size,
        height: size,
        boxShadow: ring ? `0 0 0 3px ${ring}, 0 0 0 6px rgba(0,0,0,0.5)` : undefined,
      }}
    >
      {profile.avatar_url ? (
        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full bg-f45-gradient flex items-center justify-center font-black text-white"
          style={{ fontSize: size * 0.38 }}
        >
          {badge ? badge.emoji : initial}
        </div>
      )}
    </div>
  )
}

/* ── 포디움 블록 ── */
function PodiumBlock({
  entry, rank, myUserId,
}: {
  entry: Entry | undefined
  rank: 1 | 2 | 3
  myUserId: string | null
}) {
  if (!entry) return <div className="flex-1 min-w-0" />

  const isMe = entry.profile.id === myUserId
  const badge = getTopBadge(entry.profile.total_count)

  const cfg = {
    1: {
      icon: '🏆',
      avatarSize: 72,
      ring: '#FFD700',
      stepH: 108,
      stepGrad: 'from-yellow-400 via-amber-400 to-yellow-600',
      nameColor: isMe ? 'text-blue-300' : 'text-white',
      countColor: 'text-yellow-300',
      cardBg: 'bg-gradient-to-b from-yellow-400/20 to-amber-600/5 border-yellow-500/40',
      cardGlow: 'shadow-[0_0_32px_rgba(234,179,8,0.22)]',
      iconSize: 'text-4xl',
    },
    2: {
      icon: '🥈',
      avatarSize: 60,
      ring: '#94A3B8',
      stepH: 80,
      stepGrad: 'from-slate-400 to-slate-600',
      nameColor: isMe ? 'text-blue-300' : 'text-white/90',
      countColor: 'text-slate-300',
      cardBg: 'bg-white/5 border-white/12',
      cardGlow: '',
      iconSize: 'text-3xl',
    },
    3: {
      icon: '🥉',
      avatarSize: 54,
      ring: '#F97316',
      stepH: 56,
      stepGrad: 'from-orange-400 to-orange-600',
      nameColor: isMe ? 'text-blue-300' : 'text-white/80',
      countColor: 'text-orange-300',
      cardBg: 'bg-white/4 border-white/10',
      cardGlow: '',
      iconSize: 'text-2xl',
    },
  }[rank]

  return (
    <div className="flex flex-col items-center flex-1 min-w-0 gap-0">
      {/* Medal icon */}
      <div className="h-10 flex items-end mb-2">
        <span className={`${cfg.iconSize} drop-shadow-lg leading-none`}>{cfg.icon}</span>
      </div>

      {/* Info card */}
      <div className={`w-full border rounded-2xl rounded-b-none px-2 pt-3 pb-2.5 flex flex-col items-center ${cfg.cardBg} ${cfg.cardGlow}`}>
        <AvatarCircle profile={entry.profile} size={cfg.avatarSize} ring={cfg.ring} />

        <p className={`mt-2 font-bold text-center text-xs truncate w-full px-1 leading-tight ${cfg.nameColor}`}>
          {entry.profile.nickname}
          {isMe && <span className="ml-1 text-[10px] opacity-60">나</span>}
        </p>

        {badge && (
          <span className={`text-[10px] font-semibold mt-0.5 ${badge.color}`}>
            {badge.emoji} {badge.labelKo}
          </span>
        )}

        <p className={`font-black text-sm mt-1 ${cfg.countColor}`}>
          {entry.count}
          <span className="text-white/30 text-xs font-normal ml-0.5">회</span>
        </p>
      </div>

      {/* Podium step */}
      <div
        className={`w-full rounded-b-xl bg-gradient-to-b ${cfg.stepGrad} flex items-start justify-center pt-3`}
        style={{ height: cfg.stepH }}
      >
        <span className="text-white/25 font-black text-3xl leading-none">{rank}</span>
      </div>
    </div>
  )
}

/* ── 4위+ 카드 ── */
function RankCard({
  entry, rank, myUserId, completedToday,
}: {
  entry: Entry
  rank: number
  myUserId: string | null
  completedToday: boolean
}) {
  const isMe = entry.profile.id === myUserId
  const badge = getTopBadge(entry.profile.total_count)

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
        isMe
          ? 'bg-f45-blue/12 border-f45-blue/45'
          : 'bg-[#1c1c1c] border-white/8 hover:border-white/20'
      }`}
    >
      {/* 순위 번호 */}
      <span className="w-7 text-center font-black text-white/25 text-sm flex-shrink-0">
        {rank}
      </span>

      {/* 아바타 */}
      <AvatarCircle profile={entry.profile} size={42} />

      {/* 닉네임 + 뱃지 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className={`font-bold text-sm truncate ${isMe ? 'text-white' : 'text-white/90'}`}>
            {entry.profile.nickname}
          </p>
          {isMe && (
            <span className="text-[10px] text-f45-blue-light font-bold bg-f45-blue/20 px-1.5 py-0.5 rounded border border-f45-blue/30 leading-none">
              나
            </span>
          )}
          {badge && (
            <span className={`text-[10px] font-semibold ${badge.color}`}>
              {badge.emoji}
            </span>
          )}
        </div>
        {/* 오늘 출석 여부 */}
        {completedToday && (
          <p className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5 mt-0.5">
            🔥 오늘 완료
          </p>
        )}
      </div>

      {/* 횟수 */}
      <div className="text-right flex-shrink-0">
        <span className={`font-black text-lg ${isMe ? 'text-white' : 'text-white/90'}`}>
          {entry.count}
        </span>
        <span className="text-white/30 text-xs ml-0.5">회</span>
      </div>
    </div>
  )
}

/* ── 메인 페이지 ── */
export default function RankingPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [monthly, setMonthly] = useState<Record<string, number>>({})
  const [daily, setDaily] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('total')
  const [myUserId, setMyUserId] = useState<string | null>(null)

  useEffect(() => {
    setMyUserId(getStoredUserId())
    Promise.all([getAllProfiles(), getMonthlyWorkoutCounts(), getDailyWorkoutCounts()])
      .then(([p, m, d]) => {
        setProfiles(p)
        setMonthly(m)
        setDaily(d)
      })
      .finally(() => setLoading(false))
  }, [])

  const entries: Entry[] = (() => {
    if (tab === 'total') {
      return profiles.map((p) => ({ profile: p, count: p.total_count }))
    }
    if (tab === 'monthly') {
      return profiles
        .map((p) => ({ profile: p, count: monthly[p.id] ?? 0 }))
        .filter((e) => e.count > 0)
        .sort((a, b) => b.count - a.count)
    }
    return profiles
      .filter((p) => daily[p.id])
      .sort((a, b) => b.total_count - a.total_count)
      .map((p) => ({ profile: p, count: p.total_count }))
  })()

  const podium = entries.slice(0, 3)
  const rest = entries.slice(3)
  const myRank = entries.findIndex((e) => e.profile.id === myUserId) + 1

  const tabs: { key: Tab; label: string }[] = [
    { key: 'daily', label: '📅 오늘' },
    { key: 'monthly', label: '🔥 이번달' },
    { key: 'total', label: '🏆 전체' },
  ]

  return (
    <div className="min-h-screen bg-f45-dark">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 pt-24 pb-16">

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white">랭킹</h1>
          <p className="text-white/40 text-sm mt-1">다산점 회원 누적 수업 순위</p>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-5">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === key
                  ? key === 'daily'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : key === 'monthly'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-f45-blue text-white shadow-lg'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 탭별 정보 바 */}
        {tab === 'daily' && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-5">
            <span className="text-2xl">💪</span>
            <div>
              <p className="text-emerald-300 font-bold text-sm">
                오늘 수업 완료 {Object.keys(daily).length}명
              </p>
              <p className="text-white/40 text-xs">
                {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
              </p>
            </div>
          </div>
        )}
        {tab === 'monthly' && (
          <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 mb-5">
            <div>
              <p className="text-orange-300 font-bold text-sm">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
              </p>
              <p className="text-white/40 text-xs">이번달 수업 횟수 기준</p>
            </div>
            <div className="text-right">
              <p className="text-orange-400 font-black text-2xl">{daysLeftInMonth()}</p>
              <p className="text-white/35 text-xs">일 남음</p>
            </div>
          </div>
        )}

        {/* 본문 */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-2 border-f45-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <p className="text-4xl mb-3">🏃</p>
            <p>
              {tab === 'daily'
                ? '아직 오늘 수업을 완료한 멤버가 없어요'
                : tab === 'monthly'
                ? '이번달 수업 기록이 없어요'
                : '아직 회원이 없습니다'}
            </p>
          </div>
        ) : (
          <>
            {/* ── TOP 3 포디움 ── */}
            <div className="flex items-end gap-2 mb-8 px-1">
              <PodiumBlock entry={podium[1]} rank={2} myUserId={myUserId} />
              <PodiumBlock entry={podium[0]} rank={1} myUserId={myUserId} />
              <PodiumBlock entry={podium[2]} rank={3} myUserId={myUserId} />
            </div>

            {/* ── 4위+ 리스트 ── */}
            {rest.length > 0 && (
              <>
                <p className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-3 pl-1">
                  전체 순위
                </p>
                <div className="space-y-2">
                  {rest.map((entry, i) => (
                    <RankCard
                      key={entry.profile.id}
                      entry={entry}
                      rank={i + 4}
                      myUserId={myUserId}
                      completedToday={!!daily[entry.profile.id]}
                    />
                  ))}
                </div>
              </>
            )}

            {/* 내 순위 (10위 밖) */}
            {myRank > 10 && myUserId && (
              <div className="mt-5 bg-f45-blue/10 border border-f45-blue/30 rounded-2xl flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-white/40 text-xs mb-0.5">내 순위</p>
                  <p className="text-white font-black text-xl">#{myRank}위</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-xs mb-0.5">횟수</p>
                  <p className="text-f45-red font-black text-xl">
                    {entries.find((e) => e.profile.id === myUserId)?.count ?? 0}회
                  </p>
                </div>
              </div>
            )}

            {/* 전체 인원 */}
            <p className="text-center text-white/15 text-xs mt-6">
              {tab === 'daily'
                ? `오늘 ${entries.length}명 완료`
                : tab === 'monthly'
                ? `이번달 참여 ${entries.length}명`
                : `전체 ${entries.length}명`}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
