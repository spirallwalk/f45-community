'use client'

import { useState } from 'react'

interface WorkoutButtonProps {
  hasWorkedOutToday: boolean
  onComplete: () => Promise<void>
}

export default function WorkoutButton({ hasWorkedOutToday, onComplete }: WorkoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  async function handleClick() {
    if (hasWorkedOutToday || loading) return
    setLoading(true)
    await onComplete()
    setJustCompleted(true)
    setLoading(false)
  }

  const isDone = hasWorkedOutToday || justCompleted

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleClick}
        disabled={isDone || loading}
        className={`relative w-48 h-48 rounded-full font-black text-lg transition-all duration-300 ${
          isDone
            ? 'bg-green-600/20 border-2 border-green-500 text-green-400 cursor-default'
            : loading
            ? 'bg-f45-red/50 border-2 border-f45-red text-white cursor-wait scale-95'
            : 'bg-f45-red border-2 border-f45-red-light text-white hover:scale-105 active:scale-95 pulse-red cursor-pointer'
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-sm">기록 중...</span>
          </div>
        ) : isDone ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">✓</span>
            <span className="text-sm leading-tight text-center px-2">오늘 완료!</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">🔥</span>
            <span className="text-sm leading-tight text-center px-2">오늘 수업<br />완료!</span>
          </div>
        )}
      </button>

      {isDone ? (
        <p className="text-green-400 text-sm font-semibold animate-pulse">
          오늘도 훌륭합니다! 🎉
        </p>
      ) : (
        <p className="text-white/40 text-xs">오늘 수업을 완료했나요?</p>
      )}
    </div>
  )
}
