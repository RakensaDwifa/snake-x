import { motion } from 'framer-motion'
import type { CountdownValue } from '../core/countdown.ts'
import { useLocale } from '../lib/locale.tsx'

interface CountdownOverlayProps {
  value: CountdownValue
}

export function CountdownOverlay({ value }: CountdownOverlayProps) {
  const { t } = useLocale()
  if (value === null) return null
  
  const getLabel = (v: NonNullable<CountdownValue>) => {
    if (v === 0) return { text: t.go, color: 'text-snake-400' }
    return { text: String(v), color: v === 1 ? 'text-snake-300' : 'text-slate-200' }
  }
  
  const { text, color } = getLabel(value)
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