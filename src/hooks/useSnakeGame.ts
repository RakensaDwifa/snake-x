import { useCallback, useEffect, useRef, useState } from 'react'
import type React from 'react'
import {
  POWERUP_EVERY_FOOD,
  POWERUP_LIFETIME_TICKS,
  POWERUP_SCORE_BONUS,
  POWERUP_SLOW_DURATION_MS,
  POWERUP_SLOW_FACTOR,
  tickMsFor,
} from '../core/constants.ts'
import { GameLoop } from '../core/gameLoop.ts'
import { initialSnake, spawnFood } from '../core/food.ts'
import { spawnPowerUp } from '../core/powerUp.ts'
import { canChangeDirection, stepSnake } from '../core/snakeLogic.ts'
import { bestOf, loadHighScore, loadStats, saveHighScore, saveStats } from '../lib/storage.ts'
import { isMuted, setMuted as persistMuted, sfx } from '../audio/sfx.ts'
import {
  DEATH_COLORS,
  EAT_COLORS,
  POWERUP_COLORS,
  spawnBurst,
  spawnFloat,
} from '../render/particles.ts'
import type { FloatText, Particle } from '../render/particles.ts'
import type {
  Direction,
  GameScreen,
  GameStats,
  Position,
  PowerUp,
  SpeedMode,
} from '../types/game.ts'

export interface SnakeGameController {
  screen: GameScreen
  score: number
  length: number
  highScore: number
  stats: GameStats
  won: boolean
  speedMode: SpeedMode
  muted: boolean
  snakeRef: React.MutableRefObject<Position[]>
  prevSnakeRef: React.MutableRefObject<Position[]>
  foodRef: React.MutableRefObject<Position | null>
  flashRef: React.MutableRefObject<number>
  shakeRef: React.MutableRefObject<number>
  particlesRef: React.MutableRefObject<Particle[]>
  floatsRef: React.MutableRefObject<FloatText[]>
  powerUpsRef: React.MutableRefObject<PowerUp[]>
  registerRenderer: (fn: ((interp: number) => void) | null) => void
  changeDirection: (d: Direction) => void
  startGame: () => void
  pause: () => void
  resume: () => void
  togglePause: () => void
  toMenu: () => void
  setSpeedMode: (m: SpeedMode) => void
  toggleMute: () => void
}

const PENDING_LIMIT = 3

export function useSnakeGame(): SnakeGameController {
  const [screen, setScreen] = useState<GameScreen>('splash')
  const [score, setScore] = useState(0)
  const [length, setLength] = useState(4)
  const [highScore, setHighScore] = useState(loadHighScore)
  const [stats, setStats] = useState<GameStats>(loadStats)
  const [muted, setMuted] = useState(isMuted)
  const [speedMode, setSpeedMode] = useState<SpeedMode>('normal')
  const [won, setWon] = useState(false)

  const screenRef = useRef<GameScreen>(screen)
  const snakeRef = useRef<Position[]>(initialSnake())
  const prevSnakeRef = useRef<Position[]>([])
  const foodRef = useRef<Position | null>(null)
  const powerUpsRef = useRef<PowerUp[]>([])
  const directionRef = useRef<Direction>('RIGHT')
  const pendingRef = useRef<Direction[]>([])
  const scoreRef = useRef(0)
  const speedRef = useRef<SpeedMode>('normal')
  const highScoreRef = useRef(highScore)
  const mutedRef = useRef(muted)
  const wonRef = useRef(false)
  const eatAtRef = useRef(0)
  const flashRef = useRef(0)
  const shakeRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const floatsRef = useRef<FloatText[]>([])
  const ticksRef = useRef(0)
  const foodsSincePowerRef = useRef(0)
  const slowUntilRef = useRef(0)
  const slowActiveRef = useRef(false)
  const rendererRef = useRef<((interp: number) => void) | null>(null)
  const loopRef = useRef<GameLoop | null>(null)

  const applyScreen = useCallback((next: GameScreen) => {
    screenRef.current = next
    setScreen(next)
  }, [])

  const redraw = useCallback((interp = 1) => {
    rendererRef.current?.(interp)
  }, [])

  const endGame = useCallback(
    (wonGame: boolean, finalScore: number, finalLength: number) => {
      loopRef.current?.stop()
      wonRef.current = wonGame
      setWon(wonGame)
      setScore(finalScore)
      setLength(finalLength)
      if (finalScore > highScoreRef.current) {
        const newBest = bestOf(highScoreRef.current, finalScore)
        highScoreRef.current = newBest
        setHighScore(newBest)
        saveHighScore(newBest)
        sfx.highScore()
      } else {
        sfx.death()
      }
      if (!wonGame) {
        flashRef.current = performance.now()
        shakeRef.current = performance.now()
        for (const seg of snakeRef.current) {
          particlesRef.current.push(...spawnBurst(seg.x + 0.5, seg.y + 0.5, { colors: DEATH_COLORS }))
        }
      } else {
        flashRef.current = 0
      }
      setStats((prev) => {
        const next: GameStats = {
          games: prev.games + 1,
          totalFood: prev.totalFood + finalScore,
          maxLength: bestOf(prev.maxLength, finalLength),
          wins: prev.wins + (wonGame ? 1 : 0),
        }
        saveStats(next)
        return next
      })
      applyScreen('gameover')
      redraw()
    },
    [applyScreen, redraw],
  )

  const tick = useCallback(() => {
    const now = performance.now()

    const slowProbablyActive = slowActiveRef.current && now >= slowUntilRef.current
    if (slowProbablyActive) {
      slowActiveRef.current = false
      loopRef.current?.setTickMs(tickMsFor(scoreRef.current, speedRef.current))
    }

    ticksRef.current += 1
    powerUpsRef.current = powerUpsRef.current.filter(
      (p) => ticksRef.current - p.bornTick < POWERUP_LIFETIME_TICKS,
    )
    const currentPowerUp = powerUpsRef.current[0] ?? null

    const dir = directionRef.current

    const queue = pendingRef.current
    while (queue.length > 0) {
      const candidate = queue.shift()!
      if (canChangeDirection(dir, candidate)) {
        directionRef.current = candidate
        break
      }
    }

    const result = stepSnake(
      snakeRef.current,
      directionRef.current,
      foodRef.current,
      undefined,
      currentPowerUp,
    )

    if (result.dead) {
      endGame(false, scoreRef.current, snakeRef.current.length)
      return
    }

    prevSnakeRef.current = snakeRef.current
    snakeRef.current = result.snake

    if (result.powerUpEaten && currentPowerUp) {
      powerUpsRef.current = []
      foodsSincePowerRef.current = 0
      const gained = POWERUP_SCORE_BONUS
      scoreRef.current += gained
      sfx.powerUp()
      particlesRef.current.push(
        ...spawnBurst(currentPowerUp.pos.x + 0.5, currentPowerUp.pos.y + 0.5, {
          colors: POWERUP_COLORS,
        }),
      )
      floatsRef.current.push(
        spawnFloat(currentPowerUp.pos.x + 0.5, currentPowerUp.pos.y + 0.5, `+${gained}`),
      )
      slowUntilRef.current = now + POWERUP_SLOW_DURATION_MS
      slowActiveRef.current = true
      loopRef.current?.setTickMs(tickMsFor(scoreRef.current, speedRef.current) * POWERUP_SLOW_FACTOR)
      setScore(scoreRef.current)
      setLength(result.snake.length)
      redraw()
    }

    if (result.ate) {
      scoreRef.current += 1
      eatAtRef.current = now
      sfx.eat()
      const ateAt = foodRef.current ?? result.snake[0]
      particlesRef.current.push(
        ...spawnBurst(ateAt.x + 0.5, ateAt.y + 0.5, { colors: EAT_COLORS }),
      )
      floatsRef.current.push(spawnFloat(ateAt.x + 0.5, ateAt.y + 0.5, '+1'))
      shakeRef.current = now
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(12)
      }
      const nextFood = spawnFood(result.snake)
      foodRef.current = nextFood
      setScore(scoreRef.current)
      setLength(result.snake.length)
      loopRef.current?.setTickMs(tickMsFor(scoreRef.current, speedRef.current))
      if (nextFood === null) {
        endGame(true, scoreRef.current, result.snake.length)
        return
      }

      foodsSincePowerRef.current += 1
      if (foodsSincePowerRef.current >= POWERUP_EVERY_FOOD && powerUpsRef.current.length === 0) {
        const powerUp = spawnPowerUp(
          result.snake,
          foodRef.current,
          undefined,
          'slow',
          Math.random,
          ticksRef.current,
        )
        if (powerUp) {
          powerUpsRef.current = [powerUp]
          foodsSincePowerRef.current = 0
        }
      }
    }
  }, [endGame, redraw])

  const getLoop = useCallback(() => {
    if (!loopRef.current) {
      loopRef.current = new GameLoop(tickMsFor(0, speedRef.current), tick, (interp: number) =>
        redraw(interp),
      )
    }
    return loopRef.current
  }, [tick, redraw])

  const startGame = useCallback(() => {
    getLoop()
    const snake = initialSnake()
    snakeRef.current = snake
    prevSnakeRef.current = snake.map((c) => ({ ...c }))
    foodRef.current = spawnFood(snake)
    powerUpsRef.current = []
    directionRef.current = 'RIGHT'
    pendingRef.current = []
    scoreRef.current = 0
    ticksRef.current = 0
    foodsSincePowerRef.current = 0
    slowUntilRef.current = 0
    slowActiveRef.current = false
    wonRef.current = false
    flashRef.current = 0
    shakeRef.current = 0
    particlesRef.current = []
    floatsRef.current = []
    eatAtRef.current = 0
    setScore(0)
    setLength(snake.length)
    setWon(false)
    loopRef.current?.setTickMs(tickMsFor(0, speedRef.current))
    loopRef.current?.stop()
    applyScreen('playing')
    sfx.start()
    loopRef.current?.start()
  }, [applyScreen, getLoop])

  const pause = useCallback(() => {
    if (screenRef.current !== 'playing') return
    loopRef.current?.stop()
    sfx.pause()
    applyScreen('paused')
    redraw()
  }, [applyScreen, redraw])

  const resume = useCallback(() => {
    if (screenRef.current !== 'paused') return
    sfx.resume()
    if (
      slowActiveRef.current &&
      performance.now() >= slowUntilRef.current
    ) {
      slowActiveRef.current = false
      loopRef.current?.setTickMs(tickMsFor(scoreRef.current, speedRef.current))
    }
    applyScreen('playing')
    loopRef.current?.start()
  }, [applyScreen])

  const togglePause = useCallback(() => {
    if (screenRef.current === 'playing') {
      pause()
    } else if (screenRef.current === 'paused') {
      resume()
    }
  }, [pause, resume])

  const toMenu = useCallback(() => {
    loopRef.current?.stop()
    applyScreen('menu')
  }, [applyScreen])

  const changeDirection = useCallback((next: Direction) => {
    if (screenRef.current !== 'playing') return
    const queue = pendingRef.current
    const last = queue.length > 0 ? queue[queue.length - 1] : directionRef.current
    if (canChangeDirection(last, next) && next !== last) {
      if (queue.length < PENDING_LIMIT) {
        queue.push(next)
        sfx.turn()
      }
    }
  }, [])

  const changeSpeedMode = useCallback((mode: SpeedMode) => {
    speedRef.current = mode
    setSpeedMode(mode)
  }, [])

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current
    mutedRef.current = next
    setMuted(next)
    persistMuted(next)
  }, [])

  // Auto-pause when the tab/window loses focus.
  useEffect(() => {
    const onHide = () => {
      if (screenRef.current === 'playing') pause()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('blur', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('blur', onHide)
    }
  }, [pause])

  return {
    screen,
    score,
    length,
    highScore,
    stats,
    won,
    speedMode,
    muted,
    snakeRef,
    prevSnakeRef,
    foodRef,
    flashRef,
    shakeRef,
    particlesRef,
    floatsRef,
    powerUpsRef,
    registerRenderer: (fn) => {
      rendererRef.current = fn
    },
    changeDirection,
    startGame,
    pause,
    resume,
    togglePause,
    toMenu,
    setSpeedMode: changeSpeedMode,
    toggleMute,
  }
}
