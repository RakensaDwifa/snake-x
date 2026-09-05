import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSnakeGame } from './hooks/useSnakeGame.ts'
import { useKeyboard } from './hooks/useKeyboard.ts'
import { useSwipe } from './hooks/useSwipe.ts'
import { useIsMobile } from './hooks/useIsMobile.ts'
import { BoardRenderer } from './render/BoardRenderer.tsx'
import { HUD } from './components/HUD.tsx'
import { Controls } from './components/Controls.tsx'
import { SplashScreen } from './components/screens/SplashScreen.tsx'
import { MenuScreen } from './components/screens/MenuScreen.tsx'
import { PauseScreen } from './components/screens/PauseScreen.tsx'
import { GameOverScreen } from './components/screens/GameOverScreen.tsx'
import { unlockAudio } from './audio/sfx.ts'
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

  const handleStart = useCallback(() => {
    unlockAudio()
    game.startGame()
  }, [game])

  const ensureActive = useCallback(
    (d: Direction) => {
      unlockAudio()
      if (screenRef.current === 'splash') {
        game.toMenu()
        return
      }
      game.changeDirection(d)
    },
    [game],
  )

  useKeyboard(ensureActive, () => {
    unlockAudio()
    if (screenRef.current === 'splash') {
      game.toMenu()
    } else {
      game.togglePause()
    }
  })
  useSwipe(getBoard, ensureActive)

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-surface-950 px-4 py-6">
      <AnimatePresence mode="wait">
        {game.screen === 'splash' && (
          <SplashScreen
            key="splash"
            onContinue={() => {
              unlockAudio()
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
            onSpeed={game.setSpeedMode}
            onStart={handleStart}
            onToggleMute={game.toggleMute}
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
            onToggleMute={game.toggleMute}
            onPause={game.pause}
            showPause={isMobile}
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
              flashRef={game.flashRef}
              onReady={(draw) =>
                game.registerRenderer((interp) => {
                  draw(interp)
                })
              }
            />

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
                  newBest={game.score === game.highScore && game.score > 0}
                  won={game.won}
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
  )
}
