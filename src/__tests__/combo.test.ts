import { describe, expect, it } from 'vitest'
import { COMBO_MAX_MULTIPLIER } from '../core/constants.ts'
import { multiplierFor, resolveCombo, scoreFor } from '../core/combo.ts'

describe('resolveCombo', () => {
  it('starts a combo at 1 on the first eat', () => {
    expect(resolveCombo(0, 1000, 0, 4000)).toBe(1)
  })

  it('increments when eating inside the window', () => {
    expect(resolveCombo(3, 5000, 4800, 4000)).toBe(4)
  })

  it('resets to 1 when the window elapsed', () => {
    expect(resolveCombo(5, 9000, 4800, 4000)).toBe(1)
  })
})

describe('multiplierFor', () => {
  it('maps combo to multiplier clamped at the max', () => {
    expect(multiplierFor(0)).toBe(1)
    expect(multiplierFor(1)).toBe(1)
    expect(multiplierFor(2)).toBe(2)
    expect(multiplierFor(5)).toBe(5)
    expect(multiplierFor(99)).toBe(COMBO_MAX_MULTIPLIER)
  })
})

describe('scoreFor', () => {
  it('scales base points by the combo multiplier', () => {
    expect(scoreFor(1, 1)).toBe(1)
    expect(scoreFor(1, 4)).toBe(4)
    expect(scoreFor(5, 3)).toBe(15)
    expect(scoreFor(5, 7)).toBe(25)
  })
})