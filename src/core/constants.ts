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

export const POWERUP_EVERY_FOOD = 4
export const POWERUP_LIFETIME_TICKS = 15
export const POWERUP_SLOW_FACTOR = 1.5
export const POWERUP_SLOW_DURATION_MS = 8000
export const POWERUP_DOUBLE_DURATION_MS = 8000
export const SHIELD_FREEZE_MS = 3000
export const POWERUP_SCORE_BONUS = 2

export const COMBO_WINDOW_MS = 4000
export const COMBO_MAX_MULTIPLIER = 5

export const BONUS_FOOD_POINTS = 5
export const BONUS_FOOD_CHANCE = 0.15
export const BONUS_FOOD_LIFETIME_MS = 4000

export const COUNTDOWN_MS = 850
export const COUNTDOWN_START = 3

export const WRAP_KEY = 'snake-x-wrap'
export const SCORES_KEY = 'snake-x-scores'
export const MAX_SCORES = 5
export const VOLUME_KEY = 'snake-x-volume'
export const MUSIC_KEY = 'snake-x-music'
export const PROGRESSION_KEY = 'snake-x-progression'
export const CURRENCY_KEY = 'snake-x-currency'
export const INVENTORY_KEY = 'snake-x-inventory'
export const DAILY_KEY = 'snake-x-daily'

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
