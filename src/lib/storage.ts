import {
  MAX_SCORES,
  MUSIC_KEY,
  SCORES_KEY,
  STATS_KEY,
  STORAGE_KEY,
  VOLUME_KEY,
  WRAP_KEY,
} from '../core/constants.ts'
import type { GameStats, ScoreEntry } from '../types/game.ts'

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
    return (parsed as ScoreEntry[])
      .filter(
        (e) =>
          typeof e === 'object' &&
          e !== null &&
          typeof (e as ScoreEntry).score === 'number' &&
          Number.isFinite((e as ScoreEntry).score),
      )
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
