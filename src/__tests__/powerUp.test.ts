import { describe, expect, it } from 'vitest'
import { GRID_SIZE } from '../core/constants.ts'
import { spawnPowerUp } from '../core/powerUp.ts'
import { stepSnake } from '../core/snakeLogic.ts'

function r(x: number, y: number) {
  return { x, y }
}

describe('spawnPowerUp', () => {
  it('places a power-up on a free cell, away from the snake and food', () => {
    const snake = [r(12, 12), r(11, 12), r(10, 12), r(9, 12)]
    const food = r(20, 20)
    const powerUp = spawnPowerUp(snake, food, GRID_SIZE, 'slow', () => 0, 7)

    expect(powerUp).not.toBeNull()
    expect(powerUp!.kind).toBe('slow')
    expect(powerUp!.bornTick).toBe(7)
    expect(snake.some((s) => s.x === powerUp!.pos.x && s.y === powerUp!.pos.y)).toBe(false)
    expect(powerUp!.pos).not.toEqual(food)
  })

  it('returns null when the board is full', () => {
    const fullBoard = []
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        fullBoard.push({ x, y })
      }
    }
    expect(spawnPowerUp(fullBoard, null, GRID_SIZE, 'slow', Math.random, 0)).toBeNull()
  })
})

describe('power-up pickup in stepSnake', () => {
  it('marks the eaten kind without growing the snake', () => {
    const snake = [r(12, 12), r(11, 12), r(10, 12), r(9, 12)]
    const powerUp = { pos: r(13, 12), kind: 'slow' as const, bornTick: 0 }
    const result = stepSnake(snake, 'RIGHT', null, GRID_SIZE, powerUp)

    expect(result.powerUpEaten).toBe('slow')
    expect(result.dead).toBe(false)
    expect(result.ate).toBe(false)
    expect(result.snake).toHaveLength(snake.length)
    expect(result.snake[0]).toEqual(r(13, 12))
  })

  it('does not trigger when the head misses the power-up', () => {
    const snake = [r(12, 12), r(11, 12), r(10, 12), r(9, 12)]
    const powerUp = { pos: r(20, 5), kind: 'slow' as const, bornTick: 0 }
    const result = stepSnake(snake, 'RIGHT', null, GRID_SIZE, powerUp)

    expect(result.powerUpEaten).toBeNull()
    expect(result.snake[0]).toEqual(r(13, 12))
  })

  it('eats food and power-up on the same cell, still growing', () => {
    const snake = [r(12, 12), r(11, 12), r(10, 12), r(9, 12)]
    const powerUp = { pos: r(13, 12), kind: 'slow' as const, bornTick: 0 }
    const result = stepSnake(snake, 'RIGHT', r(13, 12), GRID_SIZE, powerUp)

    expect(result.ate).toBe(true)
    expect(result.powerUpEaten).toBe('slow')
    expect(result.snake).toHaveLength(snake.length + 1)
  })
})