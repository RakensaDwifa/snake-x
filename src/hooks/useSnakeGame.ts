import { useCallback, useEffect, useRef, useState } from 'react'
import type React from 'react'
import { tickMsFor } from '../core/constants.ts'
import { GameLoop } from '../core/gameLoop.ts'
import { initialSnake, spawnFood } from '../core/food.ts'
import { canChangeDirection, stepSnake } from '../core/snakeLogic.ts'
import { bestOf, loadHighScore, saveHighScore } from '../lib/storage.ts'
import { isMuted, setMuted as persistMuted, sfx } from '../audio/sfx.ts'
import type { Direction, GameScreen, Position, SpeedMode } from '../types/game.ts'

export interface SnakeGameController {
  screen: GameScreen
  score: number
  length: number
  highScore: number
  won: boolean
  speedMode: SpeedMode
  muted: boolean
  snakeRef: React.MutableRefObject<Position[]>
  prevSnakeRef: React.MutableRefObject<Position[]>
  foodRef: React.MutableRefObject<Position | null>
  flashRef: React.MutableRefObject<number>
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
  const [muted, setMuted] = useState(isMuted)
  const [speedMode, setSpeedMode] = useState<SpeedMode>('normal')
  const [won, setWon] = useState(false)

  const screenRef = useRef<GameScreen>(screen)
  const snakeRef = useRef<Position[]>(initialSnake())
  const prevSnakeRef = useRef<Position[]>([])
  const foodRef = useRef<Position | null>(null)
  const directionRef = useRef<Direction>('RIGHT')
  const pendingRef = useRef<Direction[]>([])
  const scoreRef = useRef(0)
  const speedRef = useRef<SpeedMode>('normal')
  const highScoreRef = useRef(highScore)
  const mutedRef = useRef(muted)
  const wonRef = useRef(false)
  const eatAtRef = useRef(0)
  const flashRef = useRef(0)
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
      } else {
        flashRef.current = 0
      }
      applyScreen('gameover')
      redraw()
    },
    [applyScreen, redraw],
  )

  const tick = useCallback(() => {
    const dir = directionRef.current

    const queue = pendingRef.current
    while (queue.length > 0) {
      const candidate = queue.shift()!
      if (canChangeDirection(dir, candidate)) {
        directionRef.current = candidate
        break
      }
    }

    const result = stepSnake(snakeRef.current, directionRef.current, foodRef.current)

    if (result.dead) {
      endGame(false, scoreRef.current, snakeRef.current.length)
      return
    }

    prevSnakeRef.current = snakeRef.current
    snakeRef.current = result.snake

    if (result.ate) {
      scoreRef.current += 1
      eatAtRef.current = performance.now()
      sfx.eat()
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
    }
  }, [endGame])

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
    directionRef.current = 'RIGHT'
    pendingRef.current = []
    scoreRef.current = 0
    wonRef.current = false
    flashRef.current = 0
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
    won,
    speedMode,
    muted,
    snakeRef,
    prevSnakeRef,
    foodRef,
    flashRef,
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
