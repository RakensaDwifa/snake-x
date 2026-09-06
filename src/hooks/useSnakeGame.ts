import { useCallback, useEffect, useRef, useState } from 'react'
import type React from 'react'
import {
  BONUS_FOOD_CHANCE,
  BONUS_FOOD_LIFETIME_MS,
  BONUS_FOOD_POINTS,
  COMBO_WINDOW_MS,
  COUNTDOWN_MS,
  COUNTDOWN_START,
  POWERUP_DOUBLE_DURATION_MS,
  POWERUP_EVERY_FOOD,
  POWERUP_LIFETIME_TICKS,
  POWERUP_SCORE_BONUS,
  POWERUP_SLOW_DURATION_MS,
  POWERUP_SLOW_FACTOR,
  SHIELD_FREEZE_MS,
  tickMsFor,
} from '../core/constants.ts'
import { resolveCombo, scoreFor } from '../core/combo.ts'
import type { CountdownValue } from '../core/countdown.ts'
import { GameLoop } from '../core/gameLoop.ts'
import { initialSnake, spawnBonusFood, spawnFood } from '../core/food.ts'
import { randomPowerUpKind, spawnPowerUp } from '../core/powerUp.ts'
import { canChangeDirection, positionsEqual, stepSnake } from '../core/snakeLogic.ts'
import { getVolume, isMuted, setMuted as persistMuted, setVolume as persistVolume, sfx } from '../audio/sfx.ts'
import * as music from '../audio/music.ts'
import {
  DEATH_COLORS,
  EAT_COLORS,
  GOLDEN_COLORS,
  POWERUP_COLORS,
  SHIELD_COLORS,
  spawnBurst,
  spawnFloat,
} from '../render/particles.ts'
import type { FloatText, Particle } from '../render/particles.ts'
import * as storage from '../lib/storage.ts'
import type {
  Direction,
  GameScreen,
  GameStats,
  Position,
  PowerUp,
  PowerUpKind,
  ScoreEntry,
  SpeedMode,
} from '../types/game.ts'

export interface ActiveEffects {
  slow: boolean
  double: boolean
  shield: boolean
}

export interface SnakeGameController {
  screen: GameScreen
  score: number
  length: number
  highScore: number
  stats: GameStats
  won: boolean
  speedMode: SpeedMode
  muted: boolean
  combo: number
  activeEffects: ActiveEffects
  wrapMode: boolean
  scores: ScoreEntry[]
  countdown: CountdownValue
  volume: number
  musicOn: boolean
  effectUntil: { slow: number; double: number }
  snakeRef: React.MutableRefObject<Position[]>
  prevSnakeRef: React.MutableRefObject<Position[]>
  foodRef: React.MutableRefObject<Position | null>
  bonusFoodRef: React.MutableRefObject<Position | null>
  bonusFoodExpireAtRef: React.MutableRefObject<number>
  shieldFreezeUntilRef: React.MutableRefObject<number>
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
  toggleWrap: () => void
  toggleMusic: () => void
  setVolume: (v: number) => void
}

const PENDING_LIMIT = 3
const NO_EFFECTS: ActiveEffects = { slow: false, double: false, shield: false }

export function useSnakeGame(): SnakeGameController {
  const [screen, setScreen] = useState<GameScreen>('splash')
  const [score, setScore] = useState(0)
  const [length, setLength] = useState(4)
  const [highScore, setHighScore] = useState(storage.loadHighScore)
  const [stats, setStats] = useState<GameStats>(storage.loadStats)
  const [muted, setMuted] = useState(isMuted)
  const [speedMode, setSpeedMode] = useState<SpeedMode>('normal')
  const [won, setWon] = useState(false)
  const [combo, setCombo] = useState(0)
  const [activeEffects, setActiveEffects] = useState<ActiveEffects>(NO_EFFECTS)
  const [wrapMode, setWrapMode] = useState(storage.loadWrapMode)
  const [scores, setScores] = useState<ScoreEntry[]>(storage.loadScores)
  const [countdown, setCountdown] = useState<CountdownValue>(null)
  const [volume, setVolumeState] = useState(getVolume)
  const [musicOn, setMusicOn] = useState(music.isMusicOn)

  const scoresRef = useRef(scores)

  const screenRef = useRef<GameScreen>(screen)
  const snakeRef = useRef<Position[]>(initialSnake())
  const prevSnakeRef = useRef<Position[]>([])
  const foodRef = useRef<Position | null>(null)
  const bonusFoodRef = useRef<Position | null>(null)
  const bonusFoodExpireAtRef = useRef(0)
  const powerUpsRef = useRef<PowerUp[]>([])
  const directionRef = useRef<Direction>('RIGHT')
  const pendingRef = useRef<Direction[]>([])
  const scoreRef = useRef(0)
  const speedRef = useRef<SpeedMode>('normal')
  const highScoreRef = useRef(highScore)
  const mutedRef = useRef(muted)
  const wrapRef = useRef(wrapMode)
  const wonRef = useRef(false)
  const comboRef = useRef(0)
  const eatAtRef = useRef(0)
  const flashRef = useRef(0)
  const shakeRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const floatsRef = useRef<FloatText[]>([])
  const ticksRef = useRef(0)
  const foodsSincePowerRef = useRef(0)
  const slowUntilRef = useRef(0)
  const slowActiveRef = useRef(false)
  const doubleUntilRef = useRef(0)
  const doubleActiveRef = useRef(false)
  const shieldActiveRef = useRef(false)
  const shieldFreezeUntilRef = useRef(0)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const rendererRef = useRef<((interp: number) => void) | null>(null)
  const loopRef = useRef<GameLoop | null>(null)

  const [effectUntil, setEffectUntil] = useState({ slow: 0, double: 0 })
  const foodsEatenRef = useRef(0)
  const goldEatenRef = useRef(0)
  const bestComboRef = useRef(0)
  const playMsRef = useRef(0)

  const updateScores = useCallback((list: ScoreEntry[]) => {
    scoresRef.current = list
    setScores(list)
  }, [])

  const applyScreen = useCallback((next: GameScreen) => {
    screenRef.current = next
    setScreen(next)
  }, [])

  const redraw = useCallback((interp = 1) => {
    rendererRef.current?.(interp)
  }, [])

  const computeTickMs = useCallback(() => {
    let base = tickMsFor(scoreRef.current, speedRef.current)
    if (slowActiveRef.current) base *= POWERUP_SLOW_FACTOR
    if (doubleActiveRef.current) base /= 2
    return base
  }, [])

  const syncEffects = useCallback(() => {
    setActiveEffects({
      slow: slowActiveRef.current,
      double: doubleActiveRef.current,
      shield: shieldActiveRef.current,
    })
    setEffectUntil({
      slow: slowActiveRef.current ? slowUntilRef.current : 0,
      double: doubleActiveRef.current ? doubleUntilRef.current : 0,
    })
  }, [])

  const clearCountdown = useCallback(() => {
    if (countdownTimerRef.current !== null) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    setCountdown(null)
  }, [])

  /** Runs the 3-2-1-GO countdown, then calls `after` (loop start). */
  const runCountdown = useCallback(
    (after: () => void) => {
      clearCountdown()
      setCountdown(COUNTDOWN_START)
      sfx.countdown()
      let remaining = COUNTDOWN_START
      const id = setInterval(() => {
        if (remaining === 1) {
          setCountdown(0)
          sfx.go()
          remaining = Infinity
        } else if (remaining === Infinity) {
          clearInterval(id)
          if (countdownTimerRef.current === id) countdownTimerRef.current = null
          setCountdown(null)
          after()
        } else {
          remaining -= 1
          setCountdown(remaining as CountdownValue)
          sfx.countdown()
        }
      }, COUNTDOWN_MS)
      countdownTimerRef.current = id
    },
    [clearCountdown],
  )

  const endGame = useCallback(
    (wonGame: boolean, finalScore: number, finalLength: number) => {
      loopRef.current?.stop()
      clearCountdown()
      music.stopMusic()
      wonRef.current = wonGame
      setWon(wonGame)
      setScore(finalScore)
      setLength(finalLength)
      if (finalScore > highScoreRef.current) {
        const newBest = Math.max(highScoreRef.current, finalScore)
        highScoreRef.current = newBest
        setHighScore(newBest)
        storage.saveHighScore(newBest)
        sfx.highScore()
      } else {
        sfx.death()
      }
      const finalScores = storage.addScore(scoresRef.current, {
        score: finalScore,
        length: finalLength,
        won: wonGame,
        at: Date.now(),
      })
      storage.saveScores(finalScores)
      updateScores(finalScores)
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
          totalFood: prev.totalFood + foodsEatenRef.current,
          maxLength: Math.max(prev.maxLength, finalLength),
          wins: prev.wins + (wonGame ? 1 : 0),
          totalScore: prev.totalScore + finalScore,
          bestCombo: Math.max(prev.bestCombo, bestComboRef.current),
          goldEaten: prev.goldEaten + goldEatenRef.current,
          playSeconds: prev.playSeconds + Math.round(playMsRef.current / 1000),
        }
        storage.saveStats(next)
        return next
      })
      applyScreen('gameover')
      redraw()
    },
    [applyScreen, clearCountdown, redraw, updateScores],
  )

  const tick = useCallback(() => {
    const now = performance.now()

    const slowExpired = slowActiveRef.current && now >= slowUntilRef.current
    if (slowExpired) {
      slowActiveRef.current = false
      loopRef.current?.setTickMs(computeTickMs())
      syncEffects()
    }
    const doubleExpired = doubleActiveRef.current && now >= doubleUntilRef.current
    if (doubleExpired) {
      doubleActiveRef.current = false
      loopRef.current?.setTickMs(computeTickMs())
      syncEffects()
    }

    if (now < shieldFreezeUntilRef.current) return

    ticksRef.current += 1
    playMsRef.current += computeTickMs()
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
      wrapRef.current ? { wrap: true } : undefined,
    )

    if (result.dead) {
      if (shieldActiveRef.current) {
        shieldActiveRef.current = false
        shieldFreezeUntilRef.current = now + SHIELD_FREEZE_MS
        syncEffects()
        flashRef.current = now
        shakeRef.current = now
        const head = snakeRef.current[0]
        particlesRef.current.push(
          ...spawnBurst(head.x + 0.5, head.y + 0.5, { colors: SHIELD_COLORS }),
        )
        floatsRef.current.push(spawnFloat(head.x + 0.5, head.y + 0.5, '💥 Tameng!', 900, '#38bdf8'))
        sfx.shieldBreak()
        return
      }
      endGame(false, scoreRef.current, snakeRef.current.length)
      return
    }

    prevSnakeRef.current = snakeRef.current
    snakeRef.current = result.snake

    if (
      bonusFoodRef.current &&
      positionsEqual(result.snake[0], bonusFoodRef.current)
    ) {
      bonusFoodRef.current = null
      scoreRef.current += BONUS_FOOD_POINTS
      sfx.gold()
      foodsEatenRef.current += 1
      goldEatenRef.current += 1
      const head = result.snake[0]
      particlesRef.current.push(
        ...spawnBurst(head.x + 0.5, head.y + 0.5, { colors: GOLDEN_COLORS }),
      )
      floatsRef.current.push(
        spawnFloat(head.x + 0.5, head.y + 0.5, `+${BONUS_FOOD_POINTS} ✨`, 900, '#fbbf24'),
      )
      shakeRef.current = now
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(15)
      }
      setScore(scoreRef.current)
      redraw()
    }

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
      const kind: PowerUpKind = currentPowerUp.kind
      const hint = kind === 'shield' ? ' 🛡️' : kind === 'double' ? ' ×2' : ' 🐢'
      floatsRef.current.push(
        spawnFloat(
          currentPowerUp.pos.x + 0.5,
          currentPowerUp.pos.y + 0.5,
          `+${gained}${hint}`,
          900,
          '#c084fc',
        ),
      )
      if (kind === 'slow') {
        slowUntilRef.current = now + POWERUP_SLOW_DURATION_MS
        slowActiveRef.current = true
      } else if (kind === 'double') {
        doubleUntilRef.current = now + POWERUP_DOUBLE_DURATION_MS
        doubleActiveRef.current = true
      } else {
        shieldActiveRef.current = true
      }
      loopRef.current?.setTickMs(computeTickMs())
      syncEffects()
      setScore(scoreRef.current)
      setLength(result.snake.length)
      redraw()
    }

    if (result.ate) {
      const multiplier = scoreFor(1, comboRef.current)
      comboRef.current = resolveCombo(comboRef.current, now, eatAtRef.current, COMBO_WINDOW_MS)
      bestComboRef.current = Math.max(bestComboRef.current, comboRef.current)
      const gained = scoreFor(1, comboRef.current)
      setCombo(comboRef.current)
      scoreRef.current += gained
      eatAtRef.current = now
      sfx.eat()
      foodsEatenRef.current += 1
      const ateAt = foodRef.current ?? result.snake[0]
      particlesRef.current.push(
        ...spawnBurst(ateAt.x + 0.5, ateAt.y + 0.5, { colors: EAT_COLORS }),
      )
      floatsRef.current.push(
        spawnFloat(
          ateAt.x + 0.5,
          ateAt.y + 0.5,
          multiplier > 1 ? `+${gained} 🔥` : '+1',
        ),
      )
      shakeRef.current = now
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(12)
      }
      const nextFood = spawnFood(result.snake)
      foodRef.current = nextFood
      setScore(scoreRef.current)
      setLength(result.snake.length)
      loopRef.current?.setTickMs(computeTickMs())
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
          randomPowerUpKind(),
          Math.random,
          ticksRef.current,
        )
        if (powerUp) {
          powerUpsRef.current = [powerUp]
          foodsSincePowerRef.current = 0
        }
      }

      if (
        !bonusFoodRef.current &&
        Math.random() < BONUS_FOOD_CHANCE
      ) {
        const bonus = spawnBonusFood(result.snake, foodRef.current)
        if (bonus) {
          bonusFoodRef.current = bonus
          bonusFoodExpireAtRef.current = performance.now() + BONUS_FOOD_LIFETIME_MS
        }
      }
    }

    if (bonusFoodRef.current && now >= bonusFoodExpireAtRef.current) {
      bonusFoodRef.current = null
    }
  }, [computeTickMs, endGame, redraw, syncEffects])

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
    bonusFoodRef.current = null
    bonusFoodExpireAtRef.current = 0
    directionRef.current = 'RIGHT'
    pendingRef.current = []
    scoreRef.current = 0
    ticksRef.current = 0
    foodsSincePowerRef.current = 0
    slowUntilRef.current = 0
    slowActiveRef.current = false
    doubleUntilRef.current = 0
    doubleActiveRef.current = false
    shieldActiveRef.current = false
    shieldFreezeUntilRef.current = 0
    comboRef.current = 0
    wonRef.current = false
    flashRef.current = 0
    shakeRef.current = 0
    particlesRef.current = []
    floatsRef.current = []
    eatAtRef.current = 0
    foodsEatenRef.current = 0
    goldEatenRef.current = 0
    bestComboRef.current = 0
    playMsRef.current = 0
    setScore(0)
    setLength(snake.length)
    setWon(false)
    setCombo(0)
    syncEffects()
    loopRef.current?.setTickMs(tickMsFor(0, speedRef.current))
    loopRef.current?.stop()
    applyScreen('playing')
    music.startMusic()
    runCountdown(() => {
      loopRef.current?.start()
    })
  }, [applyScreen, getLoop, runCountdown, syncEffects])

  const pause = useCallback(() => {
    if (screenRef.current !== 'playing') return
    loopRef.current?.stop()
    clearCountdown()
    sfx.pause()
    applyScreen('paused')
    redraw()
  }, [applyScreen, clearCountdown, redraw])

  const resume = useCallback(() => {
    if (screenRef.current !== 'paused') return
    const now = performance.now()
    if (slowActiveRef.current && now >= slowUntilRef.current) {
      slowActiveRef.current = false
      syncEffects()
    }
    if (doubleActiveRef.current && now >= doubleUntilRef.current) {
      doubleActiveRef.current = false
      syncEffects()
    }
    loopRef.current?.setTickMs(computeTickMs())
    applyScreen('playing')
    music.startMusic()
    runCountdown(() => {
      loopRef.current?.start()
    })
  }, [applyScreen, computeTickMs, runCountdown, syncEffects])

  const togglePause = useCallback(() => {
    if (screenRef.current === 'playing') {
      pause()
    } else if (screenRef.current === 'paused') {
      resume()
    }
  }, [pause, resume])

  const toMenu = useCallback(() => {
    loopRef.current?.stop()
    clearCountdown()
    applyScreen('menu')
    music.startMusic()
  }, [applyScreen, clearCountdown])

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

  const toggleWrap = useCallback(() => {
    const next = !wrapRef.current
    wrapRef.current = next
    setWrapMode(next)
    storage.saveWrapMode(next)
  }, [])

  const toggleMusic = useCallback(() => {
    const next = music.toggleMusic()
    setMusicOn(next)
  }, [])

  const changeVolume = useCallback((value: number) => {
    persistVolume(value)
    setVolumeState(value)
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
    combo,
    activeEffects,
    wrapMode,
    scores,
    countdown,
    volume,
    musicOn,
    effectUntil,
    snakeRef,
    prevSnakeRef,
    foodRef,
    bonusFoodRef,
    bonusFoodExpireAtRef,
    shieldFreezeUntilRef,
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
    toggleWrap,
    toggleMusic,
    setVolume: changeVolume,
  }
}