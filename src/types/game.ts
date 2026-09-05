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
}

export interface GameStats {
  score: number
  length: number
}
