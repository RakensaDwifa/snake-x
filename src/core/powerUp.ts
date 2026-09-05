import { GRID_SIZE } from './constants.ts'
import type { Position, PowerUp, PowerUpKind } from '../types/game.ts'

/**
 * Pick a random free cell for a power-up, avoiding the snake, obstacles, and
 * the food. Returns null when no free cell exists or randomness keeps missing
 * (rare on a mostly-empty board).
 */
export function spawnPowerUp(
  snake: Position[],
  obstacles: Position[],
  food: Position | null,
  gridSize: number = GRID_SIZE,
  kind: PowerUpKind = 'slow',
  random: () => number = Math.random,
  bornTick: number = 0,
): PowerUp | null {
  const occupied = new Set<string>()
  for (const cell of [...snake, ...obstacles, ...(food ? [food] : [])]) {
    occupied.add(`${cell.x},${cell.y}`)
  }

  const free: Position[] = []
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y })
    }
  }

  if (free.length === 0) return null

  const pos = free[Math.floor(random() * free.length)]
  return { pos, kind, bornTick }
}