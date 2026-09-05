import type { Direction, SpeedMode } from '../types/game.ts'

export const GRID_SIZE = 25

export const BASE_TICK_MS = 150
export const SPEED_INCREMENT_MS = 5
export const MIN_TICK_MS = 60

export const SPEED_PRESETS: Record<SpeedMode, number> = {
  slow: 1.35,
  normal: 1,
  fast: 0.75,
}

export const INITIAL_LENGTH = 4

export const START_DIRECTION: Direction = 'RIGHT'

export const DIRECTION_DELTAS: Record<Direction, { dx: number; dy: number }> = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 },
}

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
}

export const STORAGE_KEY = 'snake-x-highscore'
export const STATS_KEY = 'snake-x-stats'

export const LEVEL_FOOD_INTERVAL = 6
export const MAX_LEVEL = 6
export const OBSTACLE_CELLS_PER_LEVEL = 4
export const SAFE_START_RADIUS = 3

export const POWERUP_EVERY_FOOD = 4
export const POWERUP_LIFETIME_TICKS = 9
export const POWERUP_SLOW_FACTOR = 1.5
export const POWERUP_SLOW_DURATION_MS = 3200
export const POWERUP_SCORE_BONUS = 2

export const SPEED_NAME: Record<SpeedMode, string> = {
  slow: 'Santai',
  normal: 'Normal',
  fast: 'Ngebut',
}

export function tickMsFor(score: number, mode: SpeedMode): number {
  const accelerated = BASE_TICK_MS - score * SPEED_INCREMENT_MS
  const clamped = Math.max(MIN_TICK_MS, accelerated)
  const prescaled = clamped * SPEED_PRESETS[mode]
  return prescaled
}
