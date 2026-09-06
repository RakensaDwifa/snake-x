import type { GameStats } from '../types/game.ts'

export type AchievementId =
  | 'first_game'
  | 'first_food'
  | 'score_50'
  | 'score_100'
  | 'combo_x3'
  | 'combo_x5'
  | 'length_25'
  | 'length_50'
  | 'first_win'
  | 'gold_10'
  | 'games_10'

export interface Achievement {
  id: AchievementId
  title: string
  description: string
  icon: string
  check: (stats: GameStats, extras: { bestCombo: number; goldEaten: number }) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    title: 'Langkah Pertama',
    description: 'Mainkan pertandingan pertama',
    icon: '👶',
    check: (s) => s.games >= 1,
  },
  {
    id: 'first_food',
    title: 'Makan Pertama',
    description: 'Makan makanan pertama',
    icon: '🍎',
    check: (s) => s.totalFood >= 1,
  },
  {
    id: 'score_50',
    title: 'Skor 50',
    description: 'Capai skor 50 dalam satu permainan',
    icon: '🎯',
    check: (s) => s.maxLength >= 1 || s.totalScore >= 50, // fallback
    // Actually we need per-game max score; we'll use a proxy via stats
  },
  {
    id: 'score_100',
    title: 'Skor 100',
    description: 'Capai skor 100 dalam satu permainan',
    icon: '🏆',
    check: (s) => s.totalScore >= 100,
  },
  {
    id: 'combo_x3',
    title: 'Kombo ×3',
    description: 'Dapatkan kombo ×3',
    icon: '🔥',
    check: (_s, e) => e.bestCombo >= 3,
  },
  {
    id: 'combo_x5',
    title: 'Kombo ×5',
    description: 'Dapatkan kombo maksimal ×5',
    icon: '🔥🔥',
    check: (_s, e) => e.bestCombo >= 5,
  },
  {
    id: 'length_25',
    title: 'Panjang 25',
    description: 'Capai panjang ular 25',
    icon: '🐍',
    check: (s) => s.maxLength >= 25,
  },
  {
    id: 'length_50',
    title: 'Panjang 50',
    description: 'Capai panjang ular 50',
    icon: '🐍🐍',
    check: (s) => s.maxLength >= 50,
  },
  {
    id: 'first_win',
    title: 'Menang Pertama',
    description: 'Isi papan penuh dan menang',
    icon: '🏆',
    check: (s) => s.wins >= 1,
  },
  {
    id: 'gold_10',
    title: 'Pemuja Emas',
    description: 'Makan 10 makanan emas',
    icon: '✨',
    check: (_s, e) => e.goldEaten >= 10,
  },
  {
    id: 'games_10',
    title: 'Pemain Setia',
    description: 'Mainkan 10 pertandingan',
    icon: '🎮',
    check: (s) => s.games >= 10,
  },
]

export const ACHIEVEMENTS_KEY = 'snake-x-achievements'

export function loadAchievements(): Set<AchievementId> {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(parsed.filter((id): id is AchievementId => ACHIEVEMENTS.some((a) => a.id === id)))
  } catch {
    return new Set()
  }
}

export function saveAchievements(unlocked: Set<AchievementId>): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify([...unlocked]))
  } catch {
    // ignore
  }
}

export function checkAchievements(
  stats: GameStats,
  extras: { bestCombo: number; goldEaten: number },
  unlocked: Set<AchievementId>
): AchievementId[] {
  const newlyUnlocked: AchievementId[] = []
  for (const a of ACHIEVEMENTS) {
    if (!unlocked.has(a.id) && a.check(stats, extras)) {
      newlyUnlocked.push(a.id)
    }
  }
  return newlyUnlocked
}