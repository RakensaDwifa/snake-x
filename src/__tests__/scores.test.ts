import { describe, expect, it } from 'vitest'
import { addScore } from '../lib/storage.ts'
import type { ScoreEntry } from '../types/game.ts'

const entry = (score: number, length = 4, won = false): ScoreEntry => ({
  score,
  length,
  won,
  at: score * 1000,
})

describe('addScore', () => {
  it('keeps the list sorted by score descending', () => {
    const board = addScore([], entry(3))
    expect(addScore(board, entry(7))).toEqual([entry(7), entry(3)])
  })

  it('trims to the top 5', () => {
    const board = [1, 2, 3, 4, 5, 6, 7].map((s) => entry(s))
    const result = addScore(board, entry(8))
    expect(result).toHaveLength(5)
    expect(result[0]).toEqual(entry(8))
    expect(result[4].score).toBe(4)
  })

  it('breaks ties by length, preserving the won flag', () => {
    const board = [entry(5, 4), entry(5, 2, true)]
    const result = addScore(board, entry(5, 3))
    expect(result.map((e) => e.length)).toEqual([4, 3, 2])
    expect(result[2].won).toBe(true)
  })

  it('does not mutate the input array', () => {
    const board = [entry(2), entry(9)]
    const copy = [...board]
    addScore(board, entry(5))
    expect(board).toEqual(copy)
  })
})