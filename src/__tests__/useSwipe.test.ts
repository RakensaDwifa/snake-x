import { describe, expect, it } from 'vitest'
import { MIN_DISTANCE, resolveDirection } from '../hooks/useSwipe.ts'

describe('resolveDirection', () => {
  it('returns null below the movement threshold', () => {
    expect(resolveDirection(5, 5)).toBeNull()
    expect(resolveDirection(MIN_DISTANCE - 1, 0)).toBeNull()
  })

  it('maps horizontal swipes to LEFT/RIGHT (dominant axis wins)', () => {
    expect(resolveDirection(60, 10)).toBe('RIGHT')
    expect(resolveDirection(-60, -10)).toBe('LEFT')
  })

  it('maps vertical swipes to UP/DOWN', () => {
    expect(resolveDirection(10, 60)).toBe('DOWN')
    expect(resolveDirection(-10, -60)).toBe('UP')
  })

  it('uses vertical when axes are equal', () => {
    expect(resolveDirection(-48, -48)).toBe('UP')
  })
})
