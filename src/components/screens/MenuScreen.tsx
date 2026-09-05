import { motion } from 'framer-motion'
import type { SpeedMode } from '../../types/game.ts'
import { SPEED_NAME, GRID_SIZE } from '../../core/constants.ts'

interface MenuScreenProps {
  highScore: number
  speedMode: SpeedMode
  muted: boolean
  onSpeed: (m: SpeedMode) => void
  onStart: () => void
  onToggleMute: () => void
}

const SPEED_ORDER: SpeedMode[] = ['slow', 'normal', 'fast']

export function MenuScreen({
  highScore,
  speedMode,
  muted,
  onSpeed,
  onStart,
  onToggleMute,
}: MenuScreenProps) {
  return (
    <motion.div
      key="menu"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35 }}
      className="flex min-h-full w-full max-w-sm flex-1 flex-col items-center justify-center gap-8 p-6"
    >
      <div className="text-center">
        <h1 className="font-display text-4xl font-extrabold text-white">
          SNAKE <span className="text-snake-400">X</span>
        </h1>
        {highScore > 0 && (
          <p className="mt-2 text-sm font-semibold text-amber-300">🏆 Best: {highScore}</p>
        )}
      </div>

      <div className="w-full rounded-2xl border border-surface-800 bg-surface-900/70 p-5">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Kecepatan
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SPEED_ORDER.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onSpeed(mode)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                speedMode === mode
                  ? 'border-snake-400 bg-snake-500/20 text-snake-300'
                  : 'border-surface-800 bg-surface-950/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              {SPEED_NAME[mode]}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-surface-800 bg-surface-950/50 p-3 text-xs text-slate-400">
          <span>
            Grid {GRID_SIZE}×{GRID_SIZE}
          </span>
          <span onClick={onToggleMute} className="cursor-pointer select-none" role="button">
            {muted ? '🔇 suara mati' : '🔊 suara nyala'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="w-full rounded-2xl bg-snake-500 px-6 py-4 text-lg font-bold text-surface-950 shadow-[0_0_30px_rgba(16,185,129,0.5)] transition hover:bg-snake-400 active:scale-95"
      >
        ▶ Mulai Main
      </button>

      <p className="text-center text-xs text-slate-500">
        Panah / WASD / geser untuk bergerak · Esc / Spasi / P untuk jeda
      </p>
      <div className="text-center text-xs text-slate-500">
        Dinding mematikan — jangan menabrak! Tangkap ⭐ bintang untuk waktu melambat.
      </div>
    </motion.div>
  )
}
