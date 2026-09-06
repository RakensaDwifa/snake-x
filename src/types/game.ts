export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export type GameScreen = 'splash' | 'menu' | 'playing' | 'paused' | 'gameover'

export type SpeedMode = 'slow' | 'normal' | 'fast'

export interface Position {
  x: number
  y: number
}

export interface StepResult {
  snake: Position[]
  food: Position | null
  ate: boolean
  dead: boolean
  win: boolean
  powerUpEaten: PowerUpKind | null
}

export type PowerUpKind = 'slow' | 'double' | 'shield'

export interface PowerUp {
  pos: Position
  kind: PowerUpKind
  bornTick: number
}

export interface StepOptions {
  wrap?: boolean
}

export interface GameStats {
  games: number
  totalFood: number
  maxLength: number
  wins: number
}

export interface ScoreEntry {
  score: number
  length: number
  won: boolean
  at: number
}