import { useEffect, useState } from 'react'

const TICK_MS = 100

/**
 * Remaining lifetime of an effect as a 0–100 integer, for the HUD chip readout.
 *
 * `useSnakeGame` stores effect deadlines against `performance.now()`, so this
 * must use the same clock or the percentage will be meaningless.
 *
 * No interval is started for effects that aren't running (`until <= 0`), so an
 * idle game costs nothing; only an active power-up ticks at 10Hz.
 */
export function useRemainingPercent(until: number, durationMs: number): number {
  const compute = () => {
    if (until <= 0 || durationMs <= 0) return 0
    const pct = ((until - performance.now()) / durationMs) * 100
    return Math.max(0, Math.min(100, Math.round(pct)))
  }

  const [percent, setPercent] = useState(compute)

  useEffect(() => {
    if (until <= 0 || durationMs <= 0) {
      setPercent(0)
      return
    }
    // Sync immediately on pickup/expiry so the chip never shows a stale value.
    setPercent(compute())
    const id = setInterval(() => setPercent(compute()), TICK_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [until, durationMs])

  return percent
}