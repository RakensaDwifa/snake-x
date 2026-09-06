import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useSnakeGame } from './hooks/useSnakeGame.ts'
import { useKeyboard } from './hooks/useKeyboard.ts'
import { useSwipe } from './hooks/useSwipe.ts'
import { useIsMobile } from './hooks/useIsMobile.ts'
import { BoardRenderer } from './render/BoardRenderer.tsx'
import { HUD } from './components/HUD.tsx'
import { Controls } from './components/Controls.tsx'
import { CountdownOverlay } from './components/CountdownOverlay.tsx'
import { SplashScreen } from './components/screens/SplashScreen.tsx'
import { MenuScreen } from './components/screens/MenuScreen.tsx'
import { PauseScreen } from './components/screens/PauseScreen.tsx'
import { GameOverScreen } from './components/screens/GameOverScreen.tsx'
import { unlockAudio } from './audio/sfx.ts'
import { startMusic } from './audio/music.ts'
import type { Direction } from './types/game.ts'

export default function App() {
  const game = useSnakeGame()
  const isMobile = useIsMobile()
  const boardRef = useRef<HTMLDivElement | null>(null)
  const screenRef = useRef(game.screen)
  useEffect(() => {
    screenRef.current = game.screen
  }, [game.screen])

  const getBoard = useCallback(() => boardRef.current, [])

  const unlock = useCallback(() => {
    unlockAudio()
    startMusic()
  }, [])

  const handleStart = useCallback(() => {
    unlock()
    game.startGame()
  }, [game, unlock])

  const ensureActive = useCallback(
    (d: Direction) => {
      unlock()
      if (screenRef.current === 'splash') {
        game.toMenu()
        return
      }
      game.changeDirection(d)
    },
    [game, unlock],
  )

  useKeyboard(ensureActive, () => {
    unlock()
    if (screenRef.current === 'splash') {
      game.toMenu()
    } else {
      game.togglePause()
    }
  })
  useSwipe(getBoard, ensureActive)

  const slowBar = EffectBar(game, 'slow')
  const doubleBar = EffectBar(game, 'double')

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-full flex-col items-center justify-center bg-surface-950 px-4 py-6">
      <AnimatePresence mode="wait">
        {game.screen === 'splash' && (
          <SplashScreen
            key="splash"
            onContinue={() => {
              unlock()
              game.toMenu()
            }}
          />
        )}
        {game.screen === 'menu' && (
          <MenuScreen
            key="menu"
            highScore={game.highScore}
            speedMode={game.speedMode}
            muted={game.muted}
            volume={game.volume}
            musicOn={game.musicOn}
            wrapMode={game.wrapMode}
            onSpeed={game.setSpeedMode}
            onStart={handleStart}
            onToggleMute={game.toggleMute}
            onToggleMusic={game.toggleMusic}
            onToggleWrap={game.toggleWrap}
            onVolume={game.setVolume}
          />
        )}
      </AnimatePresence>

      {(game.screen === 'playing' || game.screen === 'paused' || game.screen === 'gameover') && (
        <motion.div
          key="board"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex w-full max-w-md flex-col items-center"
        >
<HUD
              score={game.score}
              length={game.length}
              highScore={game.highScore}
              muted={game.muted}
              combo={game.combo}
              activeEffects={game.activeEffects}
              slowMs={slowBar.ms}
              slowUntil={slowBar.until}
              doubleMs={doubleBar.ms}
              doubleUntil={doubleBar.until}
              onToggleMute={game.toggleMute}
              onPause={game.pause}
              showPause={game.screen === 'playing'}
            />

          <div
            ref={boardRef}
            className="relative aspect-square w-full overflow-hidden rounded-2xl border border-surface-800 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
            style={{ touchAction: 'none' }}
          >
            <BoardRenderer
              snakeRef={game.snakeRef}
              prevSnakeRef={game.prevSnakeRef}
              foodRef={game.foodRef}
              bonusFoodRef={game.bonusFoodRef}
              bonusFoodExpireAtRef={game.bonusFoodExpireAtRef}
              shieldFreezeUntilRef={game.shieldFreezeUntilRef}
              flashRef={game.flashRef}
              shakeRef={game.shakeRef}
              particlesRef={game.particlesRef}
              floatsRef={game.floatsRef}
              powerUpsRef={game.powerUpsRef}
              onReady={(draw) =>
                game.registerRenderer((interp) => {
                  draw(interp)
                })
              }
            />

            <CountdownOverlay value={game.countdown} />

            <AnimatePresence>
              {game.screen === 'paused' && (
                <PauseScreen
                  key="pause"
                  onResume={game.resume}
                  onRestart={handleStart}
                  onMenu={game.toMenu}
                />
              )}
              {game.screen === 'gameover' && (
                <GameOverScreen
                  key="gameover"
                  score={game.score}
                  length={game.length}
                  highScore={game.highScore}
                  stats={game.stats}
                  newBest={game.score === game.highScore && game.score > 0}
                  won={game.won}
                  scores={game.scores}
                  onRestart={handleStart}
                  onMenu={game.toMenu}
                />
              )}
            </AnimatePresence>
          </div>

          {isMobile && game.screen !== 'gameover' && (
            <Controls
              onChangeDirection={game.screen === 'playing' ? game.changeDirection : undefined}
              onPause={game.pause}
              onResume={game.resume}
              paused={game.screen === 'paused'}
            />
          )}
        </motion.div>
      )}
      </div>
    </MotionConfig>
  )
}

interface EffectBarState {
  until: number
  ms: number
}

function EffectBar(
  game: ReturnType<typeof useSnakeGame>,
  key: 'slow' | 'double',
): EffectBarState {
  const untilRef = key === 'slow' ? game.slowUntilRef : game.doubleUntilRef
  const active = key === 'slow' ? game.activeEffects.slow : game.activeEffects.double
  const [state, setState] = useState<EffectBarState>({ until: 0, ms: 0 })
  useEffect(() => {
    if (!active) {
      setState({ until: 0, ms: 0 })
      return
    }
    const until = untilRef.current
    if (until <= 0) {
      setState({ until: 0, ms: 0 })
      return
    }
    const ms = Math.max(0, until - performance.now())
    setState({ until, ms })
  }, [active, untilRef])
  return state
}