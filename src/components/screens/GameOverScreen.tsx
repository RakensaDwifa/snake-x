import { useState } from 'react'
import { motion } from 'framer-motion'
import { GRID_SIZE } from '../../core/constants.ts'
import { GlassCard, SCRIM } from '../GlassCard.tsx'
import { CONFETTI_COLORS } from '../../render/particles.ts'
import type { GameStats, ScoreEntry } from '../../types/game.ts'
import { useLocale } from '../../lib/locale.tsx'

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
  const { t, locale } = useLocale()
  const nf = new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US')
  const fmt = (n: number) => nf.format(n)
  const latestAt = scores.reduce((max, entry) => Math.max(max, entry.at), 0)
  const [shared, setShared] = useState(false)
  const [shareError, setShareError] = useState(false)

  const handleShare = async () => {
    const text = `${t.share} ${score} ${won ? t.won : ''} — bisa ngalahin? 🐍`
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
      className={`${SCRIM} overflow-y-auto`}
    >
      {won && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
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
      <GlassCard
        tone="primary"
        className="mx-4 my-4 w-full max-w-xs p-6 text-center"
      >
        {/* Emoji badge + headline, replacing the bare <h2>. */}
        <div
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 text-3xl"
          style={
            won
              ? { borderColor: 'rgba(251,191,36,0.5)', backgroundColor: 'rgba(251,191,36,0.12)' }
              : { borderColor: 'rgba(244,63,94,0.4)', backgroundColor: 'rgba(244,63,94,0.12)' }
          }
          aria-hidden
        >
          <motion.span
            initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.08 }}
          >
            {won ? '🏆' : '💀'}
          </motion.span>
        </div>

        <h2
          className={`font-display text-2xl font-extrabold tracking-tight ${
            won ? 'text-amber-300' : 'text-rose-400'
          }`}
        >
          {won ? t.won : t.gameOver}
        </h2>

        {newBest && !won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300"
          >
            <span aria-hidden>🏅</span>
            {t.newRecord}
          </motion.div>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
          <Stat label={t.score} value={fmt(score)} accent="text-snake-300" />
          <Stat label={t.length} value={fmt(length)} accent="text-slate-200" />
          <Stat label={t.bestLabel} value={fmt(highScore)} accent="text-amber-300" />
        </div>

        {!won && scores.length > 0 && (
          <div className="mt-4 rounded-2xl border border-surface-700/60 bg-surface-950/50 p-3 text-left">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {t.topScores}
            </div>
            <ol className="space-y-1">
              {scores.map((entry, idx) => (
                <li
                  key={`${entry.at}-${idx}`}
                  className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm ${
                    entry.at === latestAt
                      ? 'bg-snake-500/15 text-snake-300'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-4 font-bold text-slate-500">{idx + 1}</span>
                    <span className="font-display tabular-nums">{fmt(entry.score)}</span>
                    {entry.won && <span title={t.won}>🏆</span>}
                  </span>
                  <span className="text-xs text-slate-500">{fmt(entry.length)} seg</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-4 space-y-1 text-xs text-slate-500">
          <p>{t.boardFull.replace('{size}', String(GRID_SIZE))}</p>
          <p>
            {t.gameStats
              .replace('{games}', String(Math.max(1, stats.games)))
              .replace('{wins}', String(stats.wins))
              .replace('{maxLength}', String(stats.maxLength))}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="w-full rounded-2xl bg-snake-500 px-6 py-3.5 font-extrabold text-surface-950 shadow-[0_0_24px_rgba(16,185,129,0.4)] transition hover:bg-snake-400 active:scale-[0.98]"
          >
            {t.restart}
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={shared}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-800/60 bg-sky-500/10 px-6 py-3 font-semibold text-sky-300 transition hover:bg-sky-500/20 active:scale-[0.98] disabled:opacity-60"
          >
            <span aria-hidden>🔗</span>
            {shared ? t.shareCopied : shareError ? t.shareFailed : t.share}
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="w-full rounded-2xl border border-transparent px-6 py-3 font-semibold text-slate-500 transition hover:bg-surface-950/60 hover:text-slate-300 active:scale-[0.98]"
          >
            {t.menu}
          </button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-surface-700/60 bg-surface-950/50 px-2 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`font-display text-xl font-bold tabular-nums ${accent}`}>{value}</div>
    </div>
  )
}