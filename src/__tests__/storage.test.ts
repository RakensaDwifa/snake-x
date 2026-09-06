import { describe, expect, it, beforeEach, vi } from 'vitest'
import { loadStats, loadScores, saveStats, saveScores, EMPTY_STATS } from '../lib/storage.ts'
import type { GameStats, ScoreEntry } from '../types/game.ts'

const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] ?? null
  },
  setItem(key: string, value: string) {
    this.store[key] = value
  },
  removeItem(key: string) {
    delete this.store[key]
  },
  clear() {
    this.store = {}
  },
}

beforeEach(() => {
  localStorageMock.clear()
  vi.stubGlobal('localStorage', localStorageMock)
})

describe('storage: loadStats migration', () => {
  it('returns EMPTY_STATS when no data', () => {
    expect(loadStats()).toEqual(EMPTY_STATS)
  })

  it('migrates old stats shape (missing new fields) to zeros', () => {
    localStorageMock.setItem('snake-x-stats', JSON.stringify({ games: 3, totalFood: 50, maxLength: 12, wins: 1 }))
    const stats = loadStats()
    expect(stats.games).toBe(3)
    expect(stats.totalFood).toBe(50)
    expect(stats.maxLength).toBe(12)
    expect(stats.wins).toBe(1)
    expect(stats.totalScore).toBe(0)
    expect(stats.bestCombo).toBe(0)
    expect(stats.goldEaten).toBe(0)
    expect(stats.playSeconds).toBe(0)
  })

  it('preserves new fields when present', () => {
    const fullStats: GameStats = {
      games: 5,
      totalFood: 100,
      maxLength: 20,
      wins: 2,
      totalScore: 500,
      bestCombo: 5,
      goldEaten: 3,
      playSeconds: 120,
    }
    localStorageMock.setItem('snake-x-stats', JSON.stringify(fullStats))
    expect(loadStats()).toEqual(fullStats)
  })

  it('handles corrupted data gracefully', () => {
    localStorageMock.setItem('snake-x-stats', 'not-json')
    expect(loadStats()).toEqual(EMPTY_STATS)
  })
})

describe('storage: loadScores validation', () => {
  it('returns empty array when no data', () => {
    expect(loadScores()).toEqual([])
  })

  it('validates and coerces score, length, won, at fields', () => {
    const raw = [
      { score: 100, length: 15, won: true, at: Date.now() },
      { score: 50, length: 'bad', won: 'yes', at: 'also-bad' },
      { score: -5, length: 4, won: false, at: 0 },
      { score: 25, length: 8, won: false, at: Date.now() - 1000 },
      { notAnEntry: true },
    ]
    localStorageMock.setItem('snake-x-scores', JSON.stringify(raw))
    const scores = loadScores()
    expect(scores).toHaveLength(2)
    expect(scores[0].score).toBe(100)
    expect(scores[0].length).toBe(15)
    expect(scores[0].won).toBe(true)
    expect(scores[1].score).toBe(25)
    expect(scores[1].length).toBe(8)
    expect(scores[1].won).toBe(false)
    expect(scores[1].at).toBeTypeOf('number')
  })

  it('trims to top 5 by score descending', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      score: i + 1,
      length: 4,
      won: false,
      at: Date.now() + i,
    }))
    localStorageMock.setItem('snake-x-scores', JSON.stringify(many))
    const scores = loadScores()
    expect(scores).toHaveLength(5)
    expect(scores[0].score).toBe(10)
    expect(scores[4].score).toBe(6)
  })
})

describe('storage: saveStats/loadStats roundtrip', () => {
  it('persists all fields', () => {
    const stats: GameStats = {
      games: 2,
      totalFood: 10,
      maxLength: 15,
      wins: 1,
      totalScore: 50,
      bestCombo: 3,
      goldEaten: 1,
      playSeconds: 30,
    }
    saveStats(stats)
    expect(loadStats()).toEqual(stats)
  })
})

describe('storage: saveScores/loadScores roundtrip', () => {
  it('persists and loads scores', () => {
    const entries: ScoreEntry[] = [
      { score: 100, length: 12, won: true, at: 1000 },
      { score: 50, length: 8, won: false, at: 2000 },
    ]
    saveScores(entries)
    expect(loadScores()).toEqual(entries)
  })
})