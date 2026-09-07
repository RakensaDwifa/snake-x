export interface Progression {
  xp: number
  level: number
  xpToNext: number
  streakLogin: number
  streakPlay: number
  lastLoginDate: string
  lastPlayDate: string
}

export const EMPTY_PROGRESSION: Progression = {
  xp: 0,
  level: 1,
  xpToNext: 100,
  streakLogin: 0,
  streakPlay: 0,
  lastLoginDate: '',
  lastPlayDate: '',
}

export const XP_PER_GAME = 10
export const XP_PER_FOOD = 5
export const XP_PER_WIN = 20
export const XP_PER_ACHIEVEMENT = 10

export const LEVEL_REWARDS: Record<number, { type: 'skin' | 'slot' | 'theme' | 'coins'; id: string; amount?: number }[]> = {
  2: [{ type: 'slot', id: 'powerup_slot_2' }],
  4: [{ type: 'slot', id: 'powerup_slot_3' }],
  6: [{ type: 'slot', id: 'powerup_slot_4' }],
  8: [{ type: 'slot', id: 'powerup_slot_5' }],
  3: [{ type: 'skin', id: 'skin_classic_green' }],
  5: [{ type: 'skin', id: 'skin_neon' }],
  7: [{ type: 'skin', id: 'skin_retro' }],
  10: [{ type: 'skin', id: 'skin_golden' }, { type: 'coins', id: 'level_10_bonus', amount: 500 }],
}

export const LEVEL_XP: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  6: 1800,
  7: 3000,
  8: 5000,
  9: 8000,
  10: 12000,
  11: 18000,
  12: 25000,
  13: 35000,
  14: 50000,
  15: 100000,
}

export function getLevelXp(level: number): number {
  if (level <= 1) return 0
  if (level > 15) return LEVEL_XP[15] + (level - 15) * 50000
  return LEVEL_XP[level] ?? LEVEL_XP[15] + (level - 15) * 50000
}

export function getLevelFromXp(xp: number): number {
  let level = 1
  for (let l = 15; l >= 1; l--) {
    if (xp >= getLevelXp(l)) {
      level = l
      break
    }
  }
  return level
}

export function getXpToNext(level: number, xp: number): number {
  const nextLevelXp = getLevelXp(level + 1)
  return Math.max(0, nextLevelXp - xp)
}

export function getLevelRewards(level: number): { type: 'skin' | 'slot' | 'theme' | 'coins'; id: string; amount?: number }[] {
  return LEVEL_REWARDS[level] ?? []
}

export function calculateLevel(xp: number): { level: number; xpToNext: number } {
  const level = getLevelFromXp(xp)
  return { level, xpToNext: getXpToNext(level, xp) }
}

export function addXp(progression: Progression, amount: number): Progression {
  const newXp = progression.xp + amount
  const { level, xpToNext } = calculateLevel(newXp)
  const leveledUp = level > progression.level

  const newProgression: Progression = {
    ...progression,
    xp: newXp,
    level,
    xpToNext,
  }

  if (leveledUp) {
    // Level up rewards handled by caller
  }

  return newProgression
}

export function addFoodXp(progression: Progression, foodCount: number): Progression {
  return addXp(progression, foodCount * XP_PER_FOOD)
}

export function addGameXp(progression: Progression): Progression {
  return addXp(progression, XP_PER_GAME)
}

export function addWinXp(progression: Progression): Progression {
  return addXp(progression, XP_PER_WIN)
}

export function addAchievementXp(progression: Progression): Progression {
  return addXp(progression, XP_PER_ACHIEVEMENT)
}

export function updateLoginStreak(progression: Progression): Progression {
  const today = new Date().toISOString().split('T')[0]
  if (progression.lastLoginDate === today) return progression

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const newStreak = progression.lastLoginDate === yesterdayStr ? progression.streakLogin + 1 : 1

  return {
    ...progression,
    streakLogin: newStreak,
    lastLoginDate: today,
  }
}

export function updatePlayStreak(progression: Progression): Progression {
  const today = new Date().toISOString().split('T')[0]
  if (progression.lastPlayDate === today) return progression

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const newStreak = progression.lastPlayDate === yesterdayStr ? progression.streakPlay + 1 : 1

  return {
    ...progression,
    streakPlay: newStreak,
    lastPlayDate: today,
  }
}

export function getDailyLoginBonus(streak: number): { xp: number; coins: number } {
  const baseCoins = 10
  const baseXp = 20
  const streakBonus = Math.min(streak, 7) * 2
  return {
    xp: baseXp + streakBonus * 5,
    coins: baseCoins + streakBonus * 2,
  }
}

export function getDailyPlayBonus(streak: number): { xp: number; coins: number } {
  const baseCoins = 5
  const baseXp = 10
  const streakBonus = Math.min(streak, 14) * 1
  return {
    xp: baseXp + streakBonus * 3,
    coins: baseCoins + streakBonus,
  }
}