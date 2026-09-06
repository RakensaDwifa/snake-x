import { describe, expect, it } from 'vitest'
import { spawnBonusFood } from '../core/food.ts'
import { positionsEqual } from '../core/snakeLogic.ts'
import type { Position } from '../types/game.ts'

const r = (x: number, y: number): Position => ({ x, y })

describe('spawnBonusFood', () => {
  it('never spawns on the snake or the normal food', () => {
    const snake = [r(5, 5), r(4, 5), r(3, 5), r(2, 5)]
    const food = r(7, 7)
    for (let i = 0; i < 50; i++) {
      const bonus = spawnBonusFood(snake, food, 10, () => 0.5)
      expect(bonus).not.toBeNull()
      const onSnake = snake.some((cell) => positionsEqual(cell, bonus!))
      expect(onSnake).toBe(false)
      expect(positionsEqual(food, bonus!)).toBe(false)
    }
  })

  it('returns null when the board is full', () => {
    const full: Position[] = []
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        full.push(r(x, y))
      }
    }
    expect(spawnBonusFood(full, null, 2, () => 0.5)).toBeNull()
  })
})