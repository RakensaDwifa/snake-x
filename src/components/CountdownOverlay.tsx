import { motion } from 'framer-motion'
import type { CountdownValue } from '../core/countdown.ts'

interface CountdownOverlayProps {
  value: CountdownValue
}

const LABEL: Record<NonNullable<CountdownValue>, { text: string; color: string }> = {
  3: { text: '3', color: 'text-slate-200' },
  2: { text: '2', color: 'text-slate-200' },
  1: { text: '1', color: 'text-snake-300' },
  0: { text: 'GO!', color: 'text-snake-400' },
}

export function CountdownOverlay({ value }: CountdownOverlayProps) {
  if (value === null) return null
  const { text, color } = LABEL[value]
  return (
    <motion.div
      key={value}
      role="status"
      aria-live="assertive"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
    >
      <span
        key={text}
        className={`countdown-pulse font-display text-7xl font-extrabold drop-shadow-[0_0_24px_rgba(16,185,129,0.6)] ${color}`}
      >
        {text}
      </span>
    </motion.div>
  )
}