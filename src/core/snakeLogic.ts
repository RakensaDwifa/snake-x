import { DIRECTION_DELTAS, GRID_SIZE, OPPOSITE_DIRECTION } from './constants.ts'
import type {
  Direction,
  Position,
  PowerUp,
  PowerUpKind,
  StepOptions,
  StepResult,
} from '../types/game.ts'

export function isOpposite(a: Direction, b: Direction): boolean {
  return OPPOSITE_DIRECTION[a] === b
}

export function canChangeDirection(current: Direction, next: Direction): boolean {
  return !isOpposite(current, next)
}

export function isOutOfBounds(pos: Position, gridSize: number = GRID_SIZE): boolean {
  return pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y
}

/** Wrap a position into the grid (toroidal board). */
export function wrapPosition(pos: Position, gridSize: number = GRID_SIZE): Position {
  return {
    x: ((pos.x % gridSize) + gridSize) % gridSize,
    y: ((pos.y % gridSize) + gridSize) % gridSize,
  }
}

function contains(cells: Position[], pos: Position): boolean {
  return cells.some((cell) => positionsEqual(cell, pos))
}

/**
 * Advance the snake by one logical tick. Pure — no randomness here;
 * if the snake eats, the caller re-spawns food via spawnFood().
 */
export function stepSnake(
  snake: Position[],
  direction: Direction,
  food: Position | null,
  gridSize: number = GRID_SIZE,
  powerUp: PowerUp | null = null,
  options: StepOptions = {},
): StepResult {
  const head = snake[0]
  const { dx, dy } = DIRECTION_DELTAS[direction]
  let next: Position = { x: head.x + dx, y: head.y + dy }

  if (isOutOfBounds(next, gridSize)) {
    if (!options.wrap) {
      return { snake, food, ate: false, dead: true, win: false, powerUpEaten: null }
    }
    next = wrapPosition(next, gridSize)
  }

  const ate = food !== null && positionsEqual(next, food)
  const powerUpEaten: PowerUpKind | null =
    powerUp !== null && positionsEqual(next, powerUp.pos) ? powerUp.kind : null

  // If we don't eat, the tail vacates its cell this tick, so exclude it from collision.
  const collisionBody = ate ? snake : snake.slice(0, -1)
  if (contains(collisionBody, next)) {
    return { snake, food, ate, dead: true, win: false, powerUpEaten }
  }

  const grown: Position[] = [next, ...snake]
  if (!ate) {
    grown.pop()
  }

  return { snake: grown, food, ate, dead: false, win: false, powerUpEaten }
}
