import {
  MAX_SCORES,
  MUSIC_KEY,
  SCORES_KEY,
  STATS_KEY,
  STORAGE_KEY,
  VOLUME_KEY,
  WRAP_KEY,
  PROGRESSION_KEY,
  CURRENCY_KEY,
  INVENTORY_KEY,
  DAILY_KEY,
} from '../core/constants.ts'
import type { GameStats, ScoreEntry, Progression, Currency, Inventory, DailyData } from '../types/game.ts'
export type { Inventory }

export function loadHighScore(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const value = raw === null ? 0 : Number.parseInt(raw, 10)
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

export function saveHighScore(score: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(score))
  } catch {
    // storage unavailable (private mode / quota) — fail silently
  }
}

export function bestOf(current: number, candidate: number): number {
  return Math.max(current, candidate)
}

export const EMPTY_STATS: GameStats = { games: 0, totalFood: 0, maxLength: 0, wins: 0, totalScore: 0, bestCombo: 0, goldEaten: 0, playSeconds: 0 }

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (raw === null) return { ...EMPTY_STATS }
    const parsed = JSON.parse(raw) as Partial<GameStats>
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
    return {
      games: num(parsed.games),
      totalFood: num(parsed.totalFood),
      maxLength: num(parsed.maxLength),
      wins: num(parsed.wins),
      totalScore: num(parsed.totalScore),
      bestCombo: num(parsed.bestCombo),
      goldEaten: num(parsed.goldEaten),
      playSeconds: num(parsed.playSeconds),
    }
  } catch {
    return { ...EMPTY_STATS }
  }
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // storage unavailable — fail silently
  }
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

export function loadProgression(): Progression {
  try {
    const raw = localStorage.getItem(PROGRESSION_KEY)
    if (raw === null) return { ...EMPTY_PROGRESSION }
    const parsed = JSON.parse(raw) as Partial<Progression>
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
    return {
      xp: num(parsed.xp),
      level: num(parsed.level) || 1,
      xpToNext: num(parsed.xpToNext),
      streakLogin: num(parsed.streakLogin),
      streakPlay: num(parsed.streakPlay),
      lastLoginDate: typeof parsed.lastLoginDate === 'string' ? parsed.lastLoginDate : '',
      lastPlayDate: typeof parsed.lastPlayDate === 'string' ? parsed.lastPlayDate : '',
    }
  } catch {
    return { ...EMPTY_PROGRESSION }
  }
}

export function saveProgression(progression: Progression): void {
  try {
    localStorage.setItem(PROGRESSION_KEY, JSON.stringify(progression))
  } catch {
    // storage unavailable — fail silently
  }
}

export const EMPTY_CURRENCY: Currency = {
  coins: 0,
  totalEarned: 0,
  totalSpent: 0,
}

export function loadCurrency(): Currency {
  try {
    const raw = localStorage.getItem(CURRENCY_KEY)
    if (raw === null) return { ...EMPTY_CURRENCY }
    const parsed = JSON.parse(raw) as Partial<Currency>
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
    return {
      coins: num(parsed.coins),
      totalEarned: num(parsed.totalEarned),
      totalSpent: num(parsed.totalSpent),
    }
  } catch {
    return { ...EMPTY_CURRENCY }
  }
}

export function saveCurrency(currency: Currency): void {
  try {
    localStorage.setItem(CURRENCY_KEY, JSON.stringify(currency))
  } catch {
    // storage unavailable — fail silently
  }
}

export const EMPTY_INVENTORY: Inventory = {
  skins: {
    skin_classic_green: { unlocked: true, source: 'level' },
  },
  equippedSkin: 'skin_classic_green',
  powerUpSlots: 1,
  equippedPowerUps: [],
}

export function loadInventory(): Inventory {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY)
    if (raw === null) return { ...EMPTY_INVENTORY }
    const parsed = JSON.parse(raw) as Partial<Inventory>
    return {
      skins: parsed.skins ?? { skin_classic_green: { unlocked: true, source: 'level' } },
      equippedSkin: typeof parsed.equippedSkin === 'string' ? parsed.equippedSkin : 'skin_classic_green',
      powerUpSlots: typeof parsed.powerUpSlots === 'number' ? parsed.powerUpSlots : 1,
      equippedPowerUps: Array.isArray(parsed.equippedPowerUps) ? parsed.equippedPowerUps : [],
    }
  } catch {
    return { ...EMPTY_INVENTORY }
  }
}

export function saveInventory(inventory: Inventory): void {
  try {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory))
  } catch {
    // storage unavailable — fail silently
  }
}

export const EMPTY_DAILY: DailyData = {
  date: '',
  seed: 0,
  completed: false,
  score: 0,
  quests: [],
  claimedRewards: [],
}

export function loadDaily(): DailyData {
  try {
    const raw = localStorage.getItem(DAILY_KEY)
    if (raw === null) return { ...EMPTY_DAILY }
    const parsed = JSON.parse(raw) as Partial<DailyData>
    const today = new Date().toISOString().split('T')[0]
    if (parsed.date !== today) return { ...EMPTY_DAILY }
    return {
      date: typeof parsed.date === 'string' ? parsed.date : today,
      seed: typeof parsed.seed === 'number' ? parsed.seed : 0,
      completed: Boolean(parsed.completed),
      score: typeof parsed.score === 'number' ? parsed.score : 0,
      quests: Array.isArray(parsed.quests) ? parsed.quests : [],
      claimedRewards: Array.isArray(parsed.claimedRewards) ? parsed.claimedRewards : [],
    }
  } catch {
    return { ...EMPTY_DAILY }
  }
}

export function saveDaily(daily: DailyData): void {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(daily))
  } catch {
    // storage unavailable — fail silently
  }
}

export function loadWrapMode(): boolean {
  try {
    return localStorage.getItem(WRAP_KEY) === '1'
  } catch {
    return false
  }
}

export function saveWrapMode(value: boolean): void {
  try {
    localStorage.setItem(WRAP_KEY, value ? '1' : '0')
  } catch {
    // storage unavailable — fail silently
  }
}

export const DEFAULT_VOLUME = 0.6

export function loadVolume(): number {
  try {
    const raw = localStorage.getItem(VOLUME_KEY)
    const value = raw === null ? DEFAULT_VOLUME : Number.parseFloat(raw)
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : DEFAULT_VOLUME
  } catch {
    return DEFAULT_VOLUME
  }
}

export function saveVolume(value: number): void {
  try {
    localStorage.setItem(VOLUME_KEY, String(Math.min(1, Math.max(0, value))))
  } catch {
    // storage unavailable — fail silently
  }
}

export function loadMusicOn(): boolean {
  try {
    return localStorage.getItem(MUSIC_KEY) !== '0'
  } catch {
    return true
  }
}

export function saveMusicOn(value: boolean): void {
  try {
    localStorage.setItem(MUSIC_KEY, value ? '1' : '0')
  } catch {
    // storage unavailable — fail silently
  }
}

export function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(SCORES_KEY)
    if (raw === null) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
    return (parsed as ScoreEntry[])
      .filter((e) => typeof e === 'object' && e !== null)
      .map((e) => {
        const obj = e as unknown as Record<string, unknown>
        return {
          score: num(obj.score),
          length: num(obj.length),
          won: Boolean(obj.won),
          at: num(obj.at),
        }
      })
      .filter((e) => e.score > 0 && e.at > 0)
      .sort((a, b) => b.score - a.score || b.length - a.length || b.at - a.at)
      .slice(0, MAX_SCORES)
  } catch {
    return []
  }
}

export function saveScores(entries: ScoreEntry[]): void {
  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify(entries.slice(0, MAX_SCORES)))
  } catch {
    // storage unavailable — fail silently
  }
}

/** Insert an entry into a top-5 board, highest score first. Pure. */
export function addScore(entries: ScoreEntry[], entry: ScoreEntry): ScoreEntry[] {
  return [...entries, entry]
    .sort((a, b) => b.score - a.score || b.length - a.length || b.at - a.at)
    .slice(0, MAX_SCORES)
}
