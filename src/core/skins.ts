export interface Skin {
  id: string
  name: string
  icon: string
  headColor: string
  bodyColor: string
  tailColor: string
  foodColor: string
  particleColors: string[]
  premium: boolean
  unlockCondition?: { type: 'level' | 'achievement' | 'daily'; value: number | string }
}

export const SKINS: Record<string, Skin> = {
  skin_classic_green: {
    id: 'skin_classic_green',
    name: 'Classic Green',
    icon: '🟢',
    headColor: '#10b981',
    bodyColor: '#34d399',
    tailColor: '#6ee7b7',
    foodColor: '#f43f5e',
    particleColors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    premium: false,
    unlockCondition: { type: 'level', value: 1 },
  },
  skin_neon: {
    id: 'skin_neon',
    name: 'Neon Glow',
    icon: '💚',
    headColor: '#00ff88',
    bodyColor: '#00cc6a',
    tailColor: '#66ffaa',
    foodColor: '#ff3366',
    particleColors: ['#00ff88', '#00cc6a', '#66ffaa', '#aaffcc'],
    premium: false,
    unlockCondition: { type: 'level', value: 5 },
  },
  skin_retro: {
    id: 'skin_retro',
    name: 'Retro Pixel',
    icon: '🟩',
    headColor: '#00aa00',
    bodyColor: '#00cc00',
    tailColor: '#44dd44',
    foodColor: '#ff3333',
    particleColors: ['#00aa00', '#00cc00', '#44dd44', '#88ee88'],
    premium: false,
    unlockCondition: { type: 'level', value: 7 },
  },
  skin_golden: {
    id: 'skin_golden',
    name: 'Golden Legend',
    icon: '🏆',
    headColor: '#fbbf24',
    bodyColor: '#fcd34d',
    tailColor: '#fde68a',
    foodColor: '#f43f5e',
    particleColors: ['#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
    premium: false,
    unlockCondition: { type: 'level', value: 10 },
  },
  skin_cyberpunk: {
    id: 'skin_cyberpunk',
    name: 'Cyberpunk',
    icon: '🌈',
    headColor: '#ec4899',
    bodyColor: '#06b6d4',
    tailColor: '#a855f7',
    foodColor: '#f43f5e',
    particleColors: ['#ec4899', '#06b6d4', '#a855f7', '#f0abfc'],
    premium: true,
  },
  skin_void: {
    id: 'skin_void',
    name: 'Void Walker',
    icon: '🟣',
    headColor: '#7c3aed',
    bodyColor: '#5b21b6',
    tailColor: '#a78bfa',
    foodColor: '#f43f5e',
    particleColors: ['#7c3aed', '#5b21b6', '#a78bfa', '#ddd6fe'],
    premium: true,
  },
  skin_fire: {
    id: 'skin_fire',
    name: 'Inferno',
    icon: '🔥',
    headColor: '#ef4444',
    bodyColor: '#f97316',
    tailColor: '#fb923c',
    foodColor: '#f43f5e',
    particleColors: ['#ef4444', '#f97316', '#fb923c', '#fed7aa'],
    premium: true,
  },
  skin_ice: {
    id: 'skin_ice',
    name: 'Frostbite',
    icon: '❄️',
    headColor: '#06b6d4',
    bodyColor: '#0ea5e9',
    tailColor: '#67e8f9',
    foodColor: '#f43f5e',
    particleColors: ['#06b6d4', '#0ea5e9', '#67e8f9', '#bae6fd'],
    premium: true,
  },
  skin_daily_streak_7: {
    id: 'skin_daily_streak_7',
    name: 'Weekly Warrior',
    icon: '🗓️',
    headColor: '#f59e0b',
    bodyColor: '#fbbf24',
    tailColor: '#fcd34d',
    foodColor: '#f43f5e',
    particleColors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'],
    premium: false,
    unlockCondition: { type: 'daily', value: 7 },
  },
  skin_daily_streak_30: {
    id: 'skin_daily_streak_30',
    name: 'Monthly Master',
    icon: '📅',
    headColor: '#ec4899',
    bodyColor: '#f472b6',
    tailColor: '#f9a8d4',
    foodColor: '#f43f5e',
    particleColors: ['#ec4899', '#f472b6', '#f9a8d4', '#fce7f3'],
    premium: false,
    unlockCondition: { type: 'daily', value: 30 },
  },
}

export function getSkin(id: string): Skin | undefined {
  return SKINS[id]
}

export function getAllSkins(): Skin[] {
  return Object.values(SKINS)
}

export function getBaseSkins(): Skin[] {
  return Object.values(SKINS).filter(s => !s.premium)
}

export function getPremiumSkins(): Skin[] {
  return Object.values(SKINS).filter(s => s.premium)
}

export function getDailySkins(): Skin[] {
  return Object.values(SKINS).filter(s => s.unlockCondition?.type === 'daily')
}

export function isSkinUnlocked(skinId: string, level: number, achievements: Set<string>, dailyStreak: number): boolean {
  const skin = SKINS[skinId]
  if (!skin) return false

  if (skin.unlockCondition) {
    const cond = skin.unlockCondition
    if (cond.type === 'level') {
      const requiredLevel = typeof cond.value === 'number' ? cond.value : parseInt(cond.value, 10)
      return level >= requiredLevel
    }
    if (cond.type === 'achievement') {
      const achId = typeof cond.value === 'string' ? cond.value : String(cond.value)
      return achievements.has(achId)
    }
    if (cond.type === 'daily') {
      const requiredStreak = typeof cond.value === 'number' ? cond.value : parseInt(cond.value, 10)
      return dailyStreak >= requiredStreak
    }
  }
  return true // base skin
}

export function getSkinColors(skinId: string): { head: string; body: string; tail: string; food: string; particles: string[] } {
  const skin = SKINS[skinId] ?? SKINS.skin_classic_green
  return {
    head: skin.headColor,
    body: skin.bodyColor,
    tail: skin.tailColor,
    food: skin.foodColor,
    particles: skin.particleColors,
  }
}

export function getSkinDisplayName(skinId: string): string {
  return SKINS[skinId]?.name ?? 'Classic Green'
}

export function getSkinIcon(skinId: string): string {
  return SKINS[skinId]?.icon ?? '🟢'
}