import { describe, expect, it } from 'vitest'
import { GRID_SIZE } from '../core/constants.ts'
import { spawnObstacleWall, wallSizeFor } from '../core/obstacles.ts'
import { buildWall } from '../core/obstacles.ts'
import { inSafeZone } from '../core/obstacles.ts'
import { stepSnake } from '../core/snakeLogic.ts'
import { initialSnake } from '../core/food.ts'

function r(x: number, y: number) {
  return { x, y }
}

/** Deterministic RNG: anchor index 0 (top-left), then positive directions. */
function seqRandom(...values: number[]): () => number {
  let i = 0
  return () => values[i++ % values.length] ?? 0.9
}

describe('wallSizeFor', () => {
  it('grows with level and caps at MAX', () => {
    expect(wallSizeFor(1)).toBe(4)
    expect(wallSizeFor(2)).toBe(8)
    expect(wallSizeFor(3)).toBe(8)
  })
})

describe('buildWall', () => {
  it('builds an L from a horizontal run then a perpendicular drop', () => {
    const wall = buildWall(r(0, 0), 1, 1, 4)
    expect(wall).toEqual([r(0, 0), r(1, 0), r(1, 1), r(1, 2)])
  })
})

describe('inSafeZone', () => {
  it('marks cells near the centre start as safe (no obstacles there)', () => {
    expect(inSafeZone(r(12, 12), GRID_SIZE)).toBe(true)
    expect(inSafeZone(r(10, 11), GRID_SIZE)).toBe(true)
  })

  it('leaves the outer board free', () => {
    expect(inSafeZone(r(0, 0), GRID_SIZE)).toBe(false)
    expect(inSafeZone(r(24, 24), GRID_SIZE)).toBe(false)
  })
})

describe('spawnObstacleWall', () => {
  it('places a deterministic wall anchored at the first free cell', () => {
    const snake = initialSnake()
    const food = r(20, 20)
    const wall = spawnObstacleWall(snake, [], food, GRID_SIZE, 2, seqRandom(0, 0.9, 0.9))

    expect(wall).toHaveLength(wallSizeFor(2))
    const seen = new Set(wall.map((c) => `${c.x},${c.y}`))
    expect(seen.size).toBe(wall.length)

    for (const cell of wall) {
      expect(cell.x).toBeGreaterThanOrEqual(0)
      expect(cell.x).toBeLessThan(GRID_SIZE)
      expect(cell.y).toBeGreaterThanOrEqual(0)
      expect(cell.y).toBeLessThan(GRID_SIZE)
      expect(inSafeZone(cell, GRID_SIZE)).toBe(false)
      expect(cell).not.toEqual(food)
      expect(snake.some((s) => s.x === cell.x && s.y === cell.y)).toBe(false)
    }
  })

  it('never duplicates an existing obstacle', () => {
    const snake = initialSnake()
    const food = r(20, 20)
    const first = spawnObstacleWall(snake, [], food, GRID_SIZE, 2, seqRandom(0, 0.9, 0.9))
    const second = spawnObstacleWall(snake, first, food, GRID_SIZE, 2, seqRandom(1, 0.9, 0.9))

    for (const cell of second) {
      expect(first.some((o) => o.x === cell.x && o.y === cell.y)).toBe(false)
    }
  })
})

describe('obstacle collision', () => {
  it('kills the snake when it steps onto an obstacle', () => {
    const snake = [r(12, 12), r(11, 12), r(10, 12), r(9, 12)]
    const obstacle = [r(13, 12)]
    const result = stepSnake(snake, 'RIGHT', null, GRID_SIZE, obstacle)
    expect(result.dead).toBe(true)
  })

  it('does not collide with obstacles elsewhere', () => {
    const snake = [r(12, 12), r(11, 12), r(10, 12), r(9, 12)]
    const obstacle = [r(12, 20)]
    const result = stepSnake(snake, 'RIGHT', null, GRID_SIZE, obstacle)
    expect(result.dead).toBe(false)
    expect(result.snake[0]).toEqual(r(13, 12))
  })
})