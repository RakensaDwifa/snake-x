export type CountdownValue = 3 | 2 | 1 | 0 | null

/** The large number shown during the pre-game countdown: 3 second to 0. */
export function countdownStart(): CountdownValue {
  return 3
}

/** Advance one countdown step: 3 -> 2 -> 1 -> 0 -> null -> null. */
export function nextCountdown(value: CountdownValue): CountdownValue {
  switch (value) {
    case 3:
      return 2
    case 2:
      return 1
    case 1:
      return 0
    default:
      return null
  }
}