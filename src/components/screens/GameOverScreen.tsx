import { motion } from 'framer-motion'
import { GRID_SIZE } from '../../core/constants.ts'

interface GameOverScreenProps {
  score: number
  length: number
  highScore: number
  newBest: boolean
  won: boolean
  onRestart: () => void
  onMenu: () => void
}

export function GameOverScreen({
  score,
  length,
  highScore,
  newBest,
  won,
  onRestart,
  onMenu,
}: GameOverScreenProps) {
  return (
    <motion.div
      key="gameover"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="mx-4 w-full max-w-xs rounded-2xl border border-surface-800 bg-surface-900/95 p-6 text-center">
        <h2
          className={`font-display text-2xl font-bold ${won ? 'text-snake-300' : 'text-rose-400'}`}
        >
          {won ? '🏆 MENANG!' : '💀 Game Over'}
        </h2>

        {newBest && !won && (
          <div className="mt-2 inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
            🎉 REKOR BARU!
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <Stat label="Skor" value={score} accent="text-snake-300" />
          <Stat label="Panjang" value={length} accent="text-slate-200" />
          <Stat label="Best" value={highScore} accent="text-amber-300" />
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Isi papan penuh ({GRID_SIZE}×{GRID_SIZE}) untuk menang.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onRestart}
            className="rounded-xl bg-snake-500 px-6 py-3 font-bold text-surface-950 transition hover:bg-snake-400 active:scale-95"
          >
            ↻ Main Lagi
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="rounded-xl border border-surface-800 bg-surface-950/40 px-6 py-3 font-semibold text-slate-400 transition hover:text-slate-200 active:scale-95"
          >
            Menu
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border border-surface-800 bg-surface-950/50 px-2 py-2">
      <div className="text-[10px] uppercase text-slate-500">{label}</div>
      <div className={`font-display text-xl font-bold ${accent}`}>{value}</div>
    </div>
  )
}
