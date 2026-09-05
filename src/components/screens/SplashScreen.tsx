import { motion } from 'framer-motion'

interface SplashScreenProps {
  onContinue: () => void
}

export function SplashScreen({ onContinue }: SplashScreenProps) {
  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 p-8"
    >
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

      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-5xl font-extrabold tracking-tight text-white"
        >
          SNAKE <span className="text-snake-400">X</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-slate-400"
        >
          menanti dari keyboard...
        </motion.p>
      </div>

      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={onContinue}
        className="animate-glow-pulse rounded-2xl border border-snake-500/40 bg-snake-500/10 px-8 py-3 font-semibold text-snake-300 transition hover:bg-snake-500/20 active:scale-95"
      >
        Ketuk untuk mulai
      </motion.button>
    </motion.div>
  )
}
