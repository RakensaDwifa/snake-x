import { GRID_SIZE } from './constants.ts'
import type { Position } from '../types/game.ts'

/**
 * Pick a random empty cell for food. Returns null when the snake fills the
 * entire board (a win).
 */
export function spawnFood(
  snake: Position[],
  gridSize: number = GRID_SIZE,
  random: () => number = Math.random,
): Position | null {
  const occupied = new Set(snake.map((cell) => `${cell.x},${cell.y}`))
  const totalCells = gridSize * gridSize
  if (occupied.size >= totalCells) return null

  const free: Position[] = []
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!occupied.has(`${x},${y}`)) {
        free.push({ x, y })
      }
    }
  }

  return free[Math.floor(random() * free.length)]
}

export function initialSnake(gridSize: number = GRID_SIZE): Position[] {
  const half = Math.floor(gridSize / 2)
  const length = 4
  const body: Position[] = []
  for (let i = 0; i < length; i++) {
    body.push({ x: half - i, y: half })
  }
  return body
}
