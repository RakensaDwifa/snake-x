import { describe, expect, it } from 'vitest'
import {
  canChangeDirection,
  isOpposite,
  isOutOfBounds,
  positionsEqual,
  stepSnake,
  wrapPosition,
} from '../core/snakeLogic.ts'
import { initialSnake, spawnFood } from '../core/food.ts'
import { GRID_SIZE } from '../core/constants.ts'
import type { Position } from '../types/game.ts'

const r = (x: number, y: number): Position => ({ x, y })

function straightSnake(): Position[] {
  return [r(5, 5), r(4, 5), r(3, 5), r(2, 5)]
}

describe('isOpposite', () => {
  it('detects opposites', () => {
    expect(isOpposite('UP', 'DOWN')).toBe(true)
    expect(isOpposite('RIGHT', 'LEFT')).toBe(true)
    expect(isOpposite('UP', 'LEFT')).toBe(false)
  })
})

describe('canChangeDirection', () => {
  it('rejects reversal', () => {
    expect(canChangeDirection('RIGHT', 'LEFT')).toBe(false)
    expect(canChangeDirection('RIGHT', 'RIGHT')).toBe(true)
    expect(canChangeDirection('RIGHT', 'UP')).toBe(true)
  })
})

describe('stepSnake', () => {
  it('moves forward and keeps length when not eating', () => {
    const result = stepSnake(straightSnake(), 'RIGHT', r(9, 9))
    expect(result.dead).toBe(false)
    expect(result.ate).toBe(false)
    expect(result.snake[0]).toEqual(r(6, 5))
    expect(result.snake).toHaveLength(4)
    expect(result.snake[3]).toEqual(r(3, 5))
  })

  it('grows and reports ate when reaching food', () => {
    const result = stepSnake(straightSnake(), 'RIGHT', r(6, 5))
    expect(result.ate).toBe(true)
    expect(result.snake).toHaveLength(5)
    expect(result.snake[0]).toEqual(r(6, 5))
    expect(result.snake[1]).toEqual(r(5, 5))
  })

  it('dies when hitting the wall', () => {
    const atEdge = [
      r(GRID_SIZE - 1, 5),
      r(GRID_SIZE - 2, 5),
      r(GRID_SIZE - 3, 5),
      r(GRID_SIZE - 4, 5),
    ]
    const result = stepSnake(atEdge, 'RIGHT', r(9, 9))
    expect(result.dead).toBe(true)
  })

  it('dies when hitting itself', () => {
    const loop = [r(5, 5), r(4, 5), r(3, 5), r(3, 6), r(4, 6), r(5, 6)]
    const result = stepSnake(loop, 'LEFT', r(9, 9))
    expect(result.dead).toBe(true)
  })

  it('does not die when moving into the tail cell', () => {
    const snake = [r(5, 5), r(5, 4), r(4, 4), r(4, 5)]
    const result = stepSnake(snake, 'LEFT', r(9, 9))
    expect(result.dead).toBe(false)
    expect(result.snake).toHaveLength(4)
  })
})

describe('wrapPosition', () => {
  it('wraps coordinates back into the grid', () => {
    expect(wrapPosition(r(-1, 0), 10)).toEqual(r(9, 0))
    expect(wrapPosition(r(10, 3), 10)).toEqual(r(0, 3))
    expect(wrapPosition(r(2, -5), 10)).toEqual(r(2, 5))
    expect(wrapPosition(r(5, 5), 10)).toEqual(r(5, 5))
  })
})

describe('stepSnake with wrap', () => {
  it('wraps to the opposite edge instead of dying when wrap is enabled', () => {
    const atRight = [
      r(GRID_SIZE - 1, 5),
      r(GRID_SIZE - 2, 5),
      r(GRID_SIZE - 3, 5),
      r(GRID_SIZE - 4, 5),
    ]
    const result = stepSnake(atRight, 'RIGHT', r(9, 9), GRID_SIZE, null, { wrap: true })
    expect(result.dead).toBe(false)
    expect(result.snake[0]).toEqual(r(0, 5))
    expect(result.snake).toHaveLength(4)
  })

  it('wraps upward into the bottom rows', () => {
    const atTop = [
      r(5, 0),
      r(5, 1),
      r(4, 1),
      r(3, 1),
    ]
    const result = stepSnake(atTop, 'UP', r(9, 9), GRID_SIZE, null, { wrap: true })
    expect(result.dead).toBe(false)
    expect(result.snake[0]).toEqual(r(5, GRID_SIZE - 1))
  })

  it('still dies without wrap', () => {
    const atRight = [
      r(GRID_SIZE - 1, 5),
      r(GRID_SIZE - 2, 5),
      r(GRID_SIZE - 3, 5),
      r(GRID_SIZE - 4, 5),
    ]
    const result = stepSnake(atRight, 'RIGHT', r(9, 9))
    expect(result.dead).toBe(true)
  })

  it('still dies on self collision even with wrap', () => {
    const loop = [r(5, 5), r(4, 5), r(3, 5), r(3, 6), r(4, 6), r(5, 6)]
    const result = stepSnake(loop, 'LEFT', r(9, 9), GRID_SIZE, null, { wrap: true })
    expect(result.dead).toBe(true)
  })
})

describe('positionsEqual', () => {
  it('compares coordinates', () => {
    expect(positionsEqual(r(1, 2), r(1, 2))).toBe(true)
    expect(positionsEqual(r(1, 2), r(2, 1))).toBe(false)
  })
})

describe('isOutOfBounds', () => {
  it('flags out-of-grid positions', () => {
    expect(isOutOfBounds(r(-1, 0))).toBe(true)
    expect(isOutOfBounds(r(0, GRID_SIZE))).toBe(true)
    expect(isOutOfBounds(r(0, 0))).toBe(false)
    expect(isOutOfBounds(r(GRID_SIZE - 1, GRID_SIZE - 1))).toBe(false)
  })
})

describe('spawnFood', () => {
  it('never spawns on the snake', () => {
    for (let i = 0; i < 50; i++) {
      const food = spawnFood(straightSnake(), 10, () => 0.5)
      expect(food).not.toBeNull()
      const onSnake = straightSnake().some((cell) => positionsEqual(cell, food!))
      expect(onSnake).toBe(false)
    }
  })

  it('returns null when the board is full', () => {
    const full: Position[] = []
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        full.push(r(x, y))
      }
    }
    expect(spawnFood(full, 2, () => 0.5)).toBeNull()
  })
})

describe('initialSnake', () => {
  it('creates a centered horizontal snake', () => {
    const snake = initialSnake()
    expect(snake).toHaveLength(4)
    expect(snake[0].x).toBeGreaterThan(snake[3].x)
    expect(snake[0].y).toBe(snake[3].y)
  })
})
