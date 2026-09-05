import { GRID_SIZE, MAX_LEVEL, OBSTACLE_CELLS_PER_LEVEL, SAFE_START_RADIUS } from './constants.ts'
import { positionsEqual } from './snakeLogic.ts'
import type { Position } from '../types/game.ts'

const MAX_WALL_SIZE = 8

/** Wall size grows with level but is capped so it never feels unfair. */
export function wallSizeFor(level: number): number {
  return Math.min(OBSTACLE_CELLS_PER_LEVEL * Math.min(Math.max(level, 1), MAX_LEVEL), MAX_WALL_SIZE)
}

export function inSafeZone(cell: Position, gridSize: number): boolean {
  const half = Math.floor(gridSize / 2)
  return (
    Math.abs(cell.x - half) <= SAFE_START_RADIUS && Math.abs(cell.y - half) <= SAFE_START_RADIUS
  )
}

/** An L-shaped wall: a horizontal run then a perpendicular drop. */
export function buildWall(anchor: Position, signX: number, signY: number, size: number): Position[] {
  const run = Math.max(1, Math.floor(size / 2))
  const rise = size - run
  const cells: Position[] = []
  for (let i = 0; i < run; i++) {
    cells.push({ x: anchor.x + signX * i, y: anchor.y })
  }
  const corner = cells[cells.length - 1]
  for (let i = 1; i <= rise; i++) {
    cells.push({ x: corner.x, y: corner.y + signY * i })
  }
  return cells
}

/**
 * Spawn a new obstacle wall for a level-up, avoiding the snake, existing
 * obstacles, food, and the safe zone around the starting cell. Returns an
 * empty array when no valid placement is found (best-effort).
 */
export function spawnObstacleWall(
  snake: Position[],
  obstacles: Position[],
  food: Position | null,
  gridSize: number = GRID_SIZE,
  level: number = 1,
  random: () => number = Math.random,
): Position[] {
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

  const size = wallSizeFor(level)

  for (let attempt = 0; attempt < 60; attempt++) {
    const anchor = free[Math.floor(random() * free.length)]
    if (!anchor) break
    const signX = random() < 0.5 ? -1 : 1
    const signY = random() < 0.5 ? -1 : 1
    const wall = buildWall(anchor, signX, signY, size)

    const valid =
      wall.length > 0 &&
      wall.every((cell) => {
        if (
          cell.x < 0 ||
          cell.x >= gridSize ||
          cell.y < 0 ||
          cell.y >= gridSize ||
          inSafeZone(cell, gridSize) ||
          occupied.has(`${cell.x},${cell.y}`)
        ) {
          return false
        }
        return true
      })

    if (valid) {
      return wall.filter((cell) => !obstacles.some((o) => positionsEqual(o, cell)))
    }
  }

  return []
}