import { describe, expect, it } from 'vitest'
import { countdownStart, nextCountdown } from '../core/countdown.ts'
import type { CountdownValue } from '../core/countdown.ts'

describe('countdown', () => {
  it('starts at 3', () => {
    expect(countdownStart()).toBe(3)
  })

  it('walks 3 -> 2 -> 1 -> 0 -> null and stays null', () => {
    const sequence: CountdownValue[] = []
    let value: CountdownValue = countdownStart()
    sequence.push(value)
    for (let i = 0; i < 5; i++) {
      value = nextCountdown(value)
      sequence.push(value)
    }
    expect(sequence).toEqual([3, 2, 1, 0, null, null])
  })

  it('stays null forever after 0', () => {
    expect(nextCountdown(null)).toBeNull()
  })
})