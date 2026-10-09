import { motion } from 'framer-motion'
import { useLocale } from '../../lib/locale.tsx'

interface SplashScreenProps {
  onContinue: () => void
}

/** Three orbiting dots that trail the logo, evoking a moving snake. */
const ORBITS = [
  { radius: 74, size: 6, duration: 3.2, color: '#34d399' },
  { radius: 88, size: 5, duration: 4.1, color: '#6ee7b7' },
  { radius: 62, size: 4, duration: 2.6, color: '#a7f3d0' },
]

export function SplashScreen({ onContinue }: SplashScreenProps) {
  const { t } = useLocale()
  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative flex min-h-full flex-1 flex-col items-center justify-center gap-8 overflow-hidden p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse at center, black 15%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 15%, transparent 70%)',
        }}
      />

      {/* Central glow behind the logo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0) 70%)',
        }}
      />

      <div className="relative flex h-44 w-44 items-center justify-center">
        {ORBITS.map((o, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: o.size, height: o.size, backgroundColor: o.color }}
            animate={{ rotate: 360 }}
            transition={{ duration: o.duration, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: o.size,
                height: o.size,
                backgroundColor: o.color,
                left: o.radius - o.size / 2,
                top: -o.size / 2,
                boxShadow: `0 0 10px ${o.color}`,
              }}
            />
          </motion.div>
        ))}

        <motion.svg
          viewBox="0 0 64 64"
          className="h-20 w-20 drop-shadow-[0_0_24px_rgba(52,211,153,0.6)]"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <circle cx="20" cy="28" r="4" fill="#a7f3d0" />
          <circle cx="44" cy="28" r="4" fill="#a7f3d0" />
          <path
            d="M14 42 Q32 54 50 42"
            fill="none"
            stroke="#34d399"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <rect x="12" y="48" width="8" height="14" rx="3" fill="#065f46" />
          <rect x="22" y="48" width="8" height="14" rx="3" fill="#0f9463" />
          <rect x="32" y="48" width="8" height="14" rx="3" fill="#10b981" />
          <rect x="42" y="48" width="8" height="14" rx="3" fill="#34d399" />
        </motion.svg>
      </div>

      <div className="relative text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_24px_rgba(16,185,129,0.35)]"
        >
          {t.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-sm text-slate-400"
        >
          {t.controls}
        </motion.p>
      </div>

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        onClick={onContinue}
        className="animate-glow-pulse relative w-full max-w-xs rounded-2xl bg-snake-500 px-8 py-4 font-extrabold text-surface-950 shadow-[0_0_30px_rgba(16,185,129,0.45)] transition hover:bg-snake-400 active:scale-[0.98]"
      >
        {t.continue}
      </motion.button>
    </motion.div>
  )
}