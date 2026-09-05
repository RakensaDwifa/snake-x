import { STATS_KEY, STORAGE_KEY } from '../core/constants.ts'
import type { GameStats } from '../types/game.ts'

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

export const EMPTY_STATS: GameStats = { games: 0, totalFood: 0, maxLength: 0, wins: 0 }

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
