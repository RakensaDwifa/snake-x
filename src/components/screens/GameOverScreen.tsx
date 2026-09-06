import { useState } from 'react'
import { motion } from 'framer-motion'
import { GRID_SIZE } from '../../core/constants.ts'
import { CONFETTI_COLORS } from '../../render/particles.ts'
import type { GameStats, ScoreEntry } from '../../types/game.ts'

interface GameOverScreenProps {
  score: number
  length: number
  highScore: number
  stats: GameStats
  newBest: boolean
  won: boolean
  scores: ScoreEntry[]
  onRestart: () => void
  onMenu: () => void
}

interface ConfettiPiece {
  id: number
  left: number
  delay: number
  duration: number
  rotate: number
  drift: number
  color: string
  size: number
}

const CONFETTI: ConfettiPiece[] = Array.from({ length: 32 }, (_, id) => ({
  id,
  left: Math.random() * 100,
  delay: Math.random() * 0.9,
  duration: 1.6 + Math.random() * 1.4,
  rotate: Math.random() * 360,
  drift: (Math.random() - 0.5) * 60,
  color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
  size: 5 + Math.random() * 6,
}))

export function GameOverScreen({
  score,
  length,
  highScore,
  stats,
  newBest,
  won,
  scores,
  onRestart,
  onMenu,
}: GameOverScreenProps) {
  const latestAt = scores.reduce((max, entry) => Math.max(max, entry.at), 0)
  const [shared, setShared] = useState(false)
  const [shareError, setShareError] = useState(false)

  const handleShare = async () => {
    const text = `Saya dapat ${score} poin di Snake X${won ? ' dan MENANG! 🏆' : ''} — bisa ngalahin? 🐍`
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const shared = await Promise.race([
          navigator.share({ text, url }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('share-timeout')), 2000),
          ),
        ])
        void shared
        setShared(true)
        return
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`)
      setShared(true)
    } catch {
      setShareError(true)
    }
  }

  return (
    <motion.div
      key="gameover"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm"
    >
      {won && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {CONFETTI.map((c) => (
            <motion.div
              key={c.id}
              initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
              animate={{ y: 300, x: c.drift, rotate: c.rotate, opacity: [1, 1, 0] }}
              transition={{ duration: c.duration, delay: c.delay, ease: 'easeIn' }}
              className="absolute top-0 rounded-sm"
              style={{ left: `${c.left}%`, width: c.size, height: c.size * 1.6, backgroundColor: c.color }}
            />
          ))}
        </div>
      )}
      <div className="mx-4 my-4 w-full max-w-xs rounded-2xl border border-surface-800 bg-surface-900/95 p-6 text-center">
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

        {!won && scores.length > 0 && (
          <div className="mt-4 rounded-xl border border-surface-800 bg-surface-950/50 p-3 text-left">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              🏅 Skor Teratas
            </div>
            <ol className="space-y-1">
              {scores.map((entry, idx) => (
                <li
                  key={`${entry.at}-${idx}`}
                  className={`flex items-center justify-between rounded-lg px-2 py-1 text-sm ${
                    entry.at === latestAt
                      ? 'bg-snake-500/15 text-snake-300'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-4 font-bold text-slate-500">{idx + 1}</span>
                    <span>{entry.score}</span>
                    {entry.won && <span title="Menang">🏆</span>}
                  </span>
                  <span className="text-xs text-slate-500">{entry.length} seg</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <p className="mt-3 text-xs text-slate-400">
          Isi papan penuh ({GRID_SIZE}×{GRID_SIZE}) untuk menang.
        </p>

        <p className="mt-3 text-xs text-slate-400">
          Game ke-{Math.max(1, stats.games)} · Menang {stats.wins}× · Panjang maks {stats.maxLength}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleShare}
            disabled={shared}
            className="rounded-xl border border-sky-800 bg-sky-500/15 px-6 py-2.5 font-semibold text-sky-300 transition hover:bg-sky-500/25 active:scale-95 disabled:opacity-60"
          >
            {shared ? '✅ Tersalin!' : shareError ? '📋 Bagikan (gagal)' : '📤 Bagikan Skor'}
          </button>
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