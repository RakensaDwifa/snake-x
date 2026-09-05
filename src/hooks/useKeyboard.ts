import { useEffect } from 'react'
import type { Direction } from '../types/game.ts'

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  s: 'DOWN',
  a: 'LEFT',
  d: 'RIGHT',
  W: 'UP',
  S: 'DOWN',
  A: 'LEFT',
  D: 'RIGHT',
}

export function useKeyboard(onDirection: (d: Direction) => void, onPause?: () => void): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key.toLowerCase() === 'p') {
        e.preventDefault()
        onPause?.()
        return
      }
      const dir = KEY_MAP[e.key]
      if (dir) {
        e.preventDefault()
        onDirection(dir)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onDirection, onPause])
}
