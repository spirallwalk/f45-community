import { BADGES, getEarnedBadges, getNextBadge } from '@/lib/badges'

interface BadgeDisplayProps {
  count: number
}

export default function BadgeDisplay({ count }: BadgeDisplayProps) {
  const earned = getEarnedBadges(count)
  const next = getNextBadge(count)

  return (
    <div className="space-y-4">
      {/* Earned badges */}
      <div className="grid grid-cols-4 gap-3">
        {BADGES.map((badge) => {
          const isEarned = count >= badge.target
          return (
            <div
              key={badge.target}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                isEarned
                  ? `${badge.bgColor} ${badge.borderColor} border`
                  : 'bg-white/3 border-white/10 opacity-40 grayscale'
              }`}
            >
              {isEarned && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-f45-red rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <span className="text-2xl">{badge.emoji}</span>
              <span className={`text-xs font-bold text-center leading-tight ${isEarned ? badge.color : 'text-white/50'}`}>
                {badge.target}회
              </span>
              <span className="text-[10px] text-white/50 text-center leading-tight">{badge.labelKo}</span>
            </div>
          )
        })}
      </div>

      {/* Progress to next badge */}
      {next ? (
        <div className={`p-4 rounded-xl ${next.bgColor} border ${next.borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{next.emoji}</span>
              <div>
                <p className="text-sm font-bold text-white">다음 목표: {next.labelKo}</p>
                <p className="text-xs text-white/60">{next.needed}회 더 하면 달성!</p>
              </div>
            </div>
            <span className={`text-sm font-black ${next.color}`}>{next.progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                next.target === 45 ? 'bg-yellow-400' :
                next.target === 100 ? 'bg-red-500' :
                next.target === 200 ? 'bg-gray-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${next.progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-white/40">{count}회</span>
            <span className="text-xs text-white/40">{next.target}회</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-cyan-400/10 border border-cyan-400 text-center">
          <p className="text-cyan-300 font-black text-lg">💎 모든 뱃지 달성!</p>
          <p className="text-white/60 text-sm">당신은 F45의 레전드입니다!</p>
        </div>
      )}
    </div>
  )
}
