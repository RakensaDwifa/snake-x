import { motion } from 'framer-motion'
import { useState } from 'react'
import { ONBOARDING_SLIDES } from '../../core/onboarding.ts'

interface OnboardingOverlayProps {
  isOpen: boolean
  onClose: () => void
  onFinish: () => void
}

export function OnboardingOverlay({ isOpen, onClose, onFinish }: OnboardingOverlayProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  if (!isOpen) return null

  const slide = ONBOARDING_SLIDES[currentSlide]
  const isLast = currentSlide === ONBOARDING_SLIDES.length - 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <motion.div
        className="w-full max-w-md rounded-2xl border border-surface-800 bg-surface-900/95 p-6"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="onboarding-title" className="font-display text-xl font-bold text-white">
            Cara Main
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 text-center">
          <span className="text-5xl">{slide.icon}</span>
          <h3 className="mt-3 font-display text-xl font-bold text-white">{slide.title}</h3>
          <p className="mt-2 text-slate-300 text-sm" dangerouslySetInnerHTML={{ __html: slide.description }} />
        </div>

        <div className="flex justify-center gap-2 mb-4">
          {ONBOARDING_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition ${
                i === currentSlide ? 'bg-snake-400' : 'bg-surface-700'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {!isLast && (
            <button
              type="button"
              onClick={() => setCurrentSlide((c) => c + 1)}
              className="flex-1 rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3 font-semibold text-slate-200 transition hover:border-slate-500 active:scale-95"
            >
              Selanjutnya
            </button>
          )}
          <button
            type="button"
            onClick={isLast ? onFinish : () => setCurrentSlide((c) => c + 1)}
            className={`
              flex-1 rounded-xl px-4 py-3 font-bold text-surface-950 transition hover:opacity-90 active:scale-95
              ${isLast
                ? 'bg-snake-500 hover:bg-snake-400'
                : 'bg-snake-500/20 text-snake-300 border border-snake-400 hover:bg-snake-500/30'
              }
            `}
          >
            {isLast ? 'Mengerti, Mulai!' : 'Lanjut'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}