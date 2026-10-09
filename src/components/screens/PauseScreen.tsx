import { motion } from 'framer-motion'
import { GlassCard, SCRIM } from '../GlassCard.tsx'
import { useLocale } from '../../lib/locale.tsx'

interface PauseScreenProps {
  onResume: () => void
  onRestart: () => void
  onMenu: () => void
}

export function PauseScreen({ onResume, onRestart, onMenu }: PauseScreenProps) {
  const { t } = useLocale()
  return (
    <motion.div
      key="pause"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={SCRIM}
    >
      <GlassCard className="mx-4 w-full max-w-xs p-7 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-snake-500/30 bg-snake-500/10 text-2xl"
          aria-hidden
        >
          ⏸
        </motion.div>

        <h2 className="font-display text-2xl font-bold tracking-tight text-white">
          {t.paused}
        </h2>
        <p className="mt-1 text-xs text-slate-400">{t.pausedHint}</p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full rounded-2xl bg-snake-500 px-6 py-3.5 font-extrabold text-surface-950 shadow-[0_0_24px_rgba(16,185,129,0.4)] transition hover:bg-snake-400 active:scale-[0.98]"
          >
            {t.resume}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full rounded-2xl border border-surface-700 bg-surface-950/60 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-surface-900 active:scale-[0.98]"
          >
            {t.restart}
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