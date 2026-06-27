export type Badge = {
  emoji: string
  label: string
  labelKo: string
  target: number
  color: string
  bgColor: string
  borderColor: string
}

export const BADGES: Badge[] = [
  {
    emoji: '🟡',
    label: 'Yellow Tee',
    labelKo: '옐로우 티셔츠',
    target: 45,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400',
  },
  {
    emoji: '🔴',
    label: 'Red Tee',
    labelKo: '레드 티셔츠',
    target: 100,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500',
  },
  {
    emoji: '🔴',
    label: 'Red Master',
    labelKo: '레드 마스터',
    target: 200,
    color: 'text-red-400',
    bgColor: 'bg-red-700/10',
    borderColor: 'border-red-700',
  },
  {
    emoji: '🟣',
    label: 'Purple Elite',
    labelKo: '퍼플 엘리트',
    target: 300,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500',
  },
  {
    emoji: '⚫',
    label: 'Black Tee',
    labelKo: '블랙 티셔츠',
    target: 400,
    color: 'text-gray-300',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-400',
  },
  {
    emoji: '💎',
    label: 'Diamond',
    labelKo: '다이아몬드',
    target: 500,
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400',
  },
]

export function getEarnedBadges(count: number): Badge[] {
  return BADGES.filter((b) => count >= b.target)
}

export function getNextBadge(count: number): (Badge & { needed: number; progress: number }) | null {
  const next = BADGES.find((b) => count < b.target)
  if (!next) return null
  const prev = BADGES.filter((b) => b.target <= count).at(-1)
  const from = prev ? prev.target : 0
  const progress = Math.round(((count - from) / (next.target - from)) * 100)
  return { ...next, needed: next.target - count, progress }
}

export function getTopBadge(count: number): Badge | null {
  return getEarnedBadges(count).at(-1) ?? null
}
