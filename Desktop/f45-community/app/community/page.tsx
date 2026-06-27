'use client'

import { useEffect, useState, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import { getPosts, createPost, deletePost, getStoredUserId, Post } from '@/lib/supabase'
import { getTopBadge } from '@/lib/badges'

type TabType = 'review' | 'suggest'
type SortType = 'latest' | 'popular'

// Deterministic mock stats per post (replace with real DB fields when available)
function getMockStats(postId: string) {
  const hash = postId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return {
    views: 10 + (hash % 180),
    comments: hash % 12,
    likes: 3 + (hash % 35),
    isPopular: hash % 6 === 0,
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('review')
  const [sort, setSort] = useState<SortType>('latest')
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [writeType, setWriteType] = useState<TabType>('review')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [writeError, setWriteError] = useState('')

  const loadPosts = useCallback(async () => {
    const data = await getPosts(60)
    setPosts(data)
  }, [])

  useEffect(() => {
    setMyUserId(getStoredUserId())
    loadPosts().finally(() => setLoading(false))
  }, [loadPosts])

  function openWrite(type: TabType) {
    if (!myUserId) {
      window.location.href = '/login'
      return
    }
    setWriteType(type)
    setContent('')
    setWriteError('')
    setShowWriteModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !myUserId) return
    setSubmitting(true)
    setWriteError('')
    const result = await createPost(myUserId, content)
    if (result.success) {
      setContent('')
      setShowWriteModal(false)
      await loadPosts()
    } else {
      setWriteError(result.error ?? '오류가 발생했습니다.')
    }
    setSubmitting(false)
  }

  async function handleDelete(postId: string) {
    if (!myUserId) return
    if (!confirm('게시글을 삭제할까요?')) return
    const ok = await deletePost(postId, myUserId)
    if (ok) setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  function handleLike(postId: string) {
    setLikedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  // Demo: split posts into tabs by index. In production, use post_type from DB.
  const reviewPosts = posts.filter((_, i) => i % 3 !== 0)
  const suggestPosts = posts.filter((_, i) => i % 3 === 0)
  const displayPosts = activeTab === 'review' ? reviewPosts : suggestPosts

  const sortedPosts = [...displayPosts].sort((a, b) => {
    if (sort === 'popular') {
      const sa = getMockStats(a.id)
      const sb = getMockStats(b.id)
      return sb.likes + sb.views - (sa.likes + sa.views)
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const isSuggestTab = activeTab === 'suggest'

  return (
    <div className="min-h-screen bg-f45-dark">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">

        {/* ── Header ── */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-white">커뮤니티</h1>
            <p className="text-white/50 mt-1 text-sm leading-relaxed max-w-sm">
              오늘 운동 어땠는지 남기고, F45에 바라는 점도 자유롭게 적어보세요
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0 pt-1">
            <button
              onClick={() => openWrite('suggest')}
              className="px-4 py-2 rounded-xl border border-white/25 text-white/70 text-sm font-semibold hover:border-white/50 hover:text-white transition-all whitespace-nowrap"
            >
              F45에 바란다
            </button>
            <button
              onClick={() => openWrite(activeTab)}
              className="px-4 py-2 rounded-xl bg-f45-red hover:bg-f45-red-dark text-white text-sm font-bold transition-all active:scale-95 whitespace-nowrap"
            >
              글쓰기
            </button>
          </div>
        </div>

        {/* ── Tabs + Sort ── */}
        <div className="flex items-center justify-between border-b border-white/10 mb-5">
          <div className="flex">
            {([
              { key: 'review', label: '오늘의 후기' },
              { key: 'suggest', label: 'F45에 바란다' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'text-white border-f45-red'
                    : 'text-white/40 border-transparent hover:text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs pb-3">
            <button
              onClick={() => setSort('latest')}
              className={`px-2 py-1 rounded transition-all font-medium ${
                sort === 'latest' ? 'text-white' : 'text-white/35 hover:text-white/60'
              }`}
            >
              최신순
            </button>
            <span className="text-white/20">/</span>
            <button
              onClick={() => setSort('popular')}
              className={`px-2 py-1 rounded transition-all font-medium ${
                sort === 'popular' ? 'text-white' : 'text-white/35 hover:text-white/60'
              }`}
            >
              인기순
            </button>
          </div>
        </div>

        {/* ── Feed ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-f45-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <p className="text-4xl mb-3">🏃</p>
            <p>아직 게시글이 없습니다. 첫 번째 글을 남겨보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPosts.map((post) => {
              const profile = post.profiles
              const badge = profile ? getTopBadge(profile.total_count) : null
              const isMe = post.user_id === myUserId
              const stats = getMockStats(post.id)
              const isLiked = likedPosts.has(post.id)

              return (
                <div
                  key={post.id}
                  className={`bg-[#1c1c1c] border rounded-2xl p-4 shadow-lg transition-all hover:shadow-xl hover:border-white/20 ${
                    isMe ? 'border-f45-blue/40' : 'border-white/8'
                  }`}
                >
                  {/* Popular badge */}
                  {stats.isPopular && (
                    <div className="inline-flex items-center gap-1 bg-orange-500/15 text-orange-400 text-xs font-bold px-2.5 py-0.5 rounded-full mb-3 border border-orange-500/25">
                      🔥 인기
                    </div>
                  )}

                  {/* Content preview */}
                  <p className="text-white/85 text-sm leading-relaxed line-clamp-2 mb-3">
                    {post.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/6">
                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs text-white/40 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md overflow-hidden flex-shrink-0">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-f45-gradient flex items-center justify-center text-[9px] font-black text-white">
                              {badge ? badge.emoji : (profile?.nickname?.[0]?.toUpperCase() ?? '?')}
                            </div>
                          )}
                        </div>
                        <span className="text-white/60 font-medium">
                          {isSuggestTab ? '익명' : (profile?.nickname ?? '알 수 없음')}
                        </span>
                        {isMe && !isSuggestTab && (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-f45-blue/20 text-f45-blue-light border border-f45-blue/30 leading-none">
                            나
                          </span>
                        )}
                      </div>
                      <span className="text-white/20">·</span>
                      <span>{timeAgo(post.created_at)}</span>
                      <span className="text-white/20">·</span>
                      <span className="flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {stats.views}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {stats.comments}
                      </span>
                    </div>

                    {/* Right side: like (suggest) or delete (mine) */}
                    <div className="flex items-center gap-2">
                      {isSuggestTab && (
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            isLiked
                              ? 'bg-f45-blue/25 text-f45-blue-light border-f45-blue/40'
                              : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white/60'
                          }`}
                        >
                          👍 {stats.likes + (isLiked ? 1 : 0)}
                        </button>
                      )}
                      {isMe && (
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-white/20 hover:text-red-400 transition-colors p-1"
                          title="삭제"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Write Modal ── */}
      {showWriteModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowWriteModal(false) }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-[#1c1c1c] border border-white/15 rounded-2xl p-6 shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-white">
                  {writeType === 'review' ? '오늘의 후기 남기기' : 'F45에 바란다'}
                </h2>
                <p className="text-white/40 text-xs mt-0.5">
                  {writeType === 'suggest' ? '익명으로 게시됩니다' : '닉네임이 공개됩니다'}
                </p>
              </div>
              <button
                onClick={() => setShowWriteModal(false)}
                className="text-white/30 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tab toggle inside modal */}
            <div className="flex gap-2 mb-4">
              {([
                { key: 'review', label: '오늘의 후기' },
                { key: 'suggest', label: 'F45에 바란다' },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setWriteType(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    writeType === t.key
                      ? 'bg-f45-red text-white'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  writeType === 'review'
                    ? '오늘 수업 어땠나요? 느낀 점, 힘들었던 동작, 칭찬 등 자유롭게 남겨주세요 🔥'
                    : 'F45에 바라는 점이나 개선 사항을 자유롭게 적어주세요. 익명으로 게시됩니다.'
                }
                className="input-field resize-none h-32 mb-3"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-xs">{content.length}/500</span>
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="btn-primary py-2 px-6 text-sm"
                >
                  {submitting ? '게시 중...' : '게시하기 →'}
                </button>
              </div>
              {writeError && <p className="text-red-400 text-sm mt-2">{writeError}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
