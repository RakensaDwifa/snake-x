import { useEffect, useRef } from 'react'
import type { Direction } from '../types/game.ts'

interface SwipePoint {
  x: number
  y: number
  time: number
}

const MIN_DISTANCE = 24
const MAX_DURATION = 500

function resolveDirection(deltaX: number, deltaY: number): Direction | null {
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)
  if (Math.max(absX, absY) < MIN_DISTANCE) return null
  if (absX > absY) {
    return deltaX > 0 ? 'RIGHT' : 'LEFT'
  }
  return deltaY > 0 ? 'DOWN' : 'UP'
}

export { resolveDirection, MIN_DISTANCE }

/**
 * Attaches touch swipe handling to the given element. Direction changes are
 * validated upstream (reversal is rejected in useSnakeGame), so this only
 * reports the raw swipe direction.
 */
export function useSwipe(
  getElement: () => HTMLElement | null,
  onDirection: (d: Direction) => void,
): void {
  const startRef = useRef<SwipePoint | null>(null)
  const onDirRef = useRef(onDirection)
  useEffect(() => {
    onDirRef.current = onDirection
  }, [onDirection])

  useEffect(() => {
    const element = getElement()
    if (!element) return

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      startRef.current = { x: touch.clientX, y: touch.clientY, time: performance.now() }
    }

    const onTouchEnd = (e: TouchEvent) => {
      const start = startRef.current
      startRef.current = null
      if (!start) return
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - start.x
      const deltaY = touch.clientY - start.y
      const elapsed = performance.now() - start.time
      if (elapsed > MAX_DURATION) return
      const dir = resolveDirection(deltaX, deltaY)
      if (dir) onDirRef.current(dir)
    }

    element.addEventListener('touchstart', onTouchStart, { passive: true })
    element.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      element.removeEventListener('touchstart', onTouchStart)
      element.removeEventListener('touchend', onTouchEnd)
    }
  }, [getElement])
}
