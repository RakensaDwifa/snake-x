import { COMBO_MAX_MULTIPLIER } from './constants.ts'

/**
 * Next combo value. `prev = 0` means "no active streak", so the first eat
 * always starts a combo of 1. Eating again within `windowMs` increments the
 * streak; otherwise it resets to 1.
 */
export function resolveCombo(
  prev: number,
  now: number,
  lastEatAt: number,
  windowMs: number,
): number {
  if (prev > 0 && now - lastEatAt <= windowMs) return prev + 1
  return 1
}

/** The score multiplier a combo grants, clamped to the combo max. */
export function multiplierFor(combo: number): number {
  return Math.min(Math.max(1, Math.floor(combo)), COMBO_MAX_MULTIPLIER)
}

/** Points gained for eating, applying the combo multiplier. */
export function scoreFor(basePoints: number, combo: number): number {
  return basePoints * multiplierFor(combo)
}