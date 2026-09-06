import { motion } from 'framer-motion'
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
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="mx-4 w-full max-w-xs rounded-2xl border border-surface-800 bg-surface-900/95 p-6 text-center">
        <h2 className="font-display text-2xl font-bold text-white">{t.paused}</h2>
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="rounded-xl bg-snake-500 px-6 py-3 font-bold text-surface-950 transition hover:bg-snake-400 active:scale-95"
          >
            {t.resume}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="rounded-xl border border-surface-700 bg-surface-950/60 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
          >
            {t.restart}
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="rounded-xl border border-surface-800 bg-surface-950/40 px-6 py-3 font-semibold text-slate-400 transition hover:text-slate-200 active:scale-95"
          >
            {t.menu}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
