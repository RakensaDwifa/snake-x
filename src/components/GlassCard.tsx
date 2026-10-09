import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  /** Emerald glow for primary cards, slate for neutral ones. */
  tone?: 'primary' | 'neutral'
}

/**
 * Shared frosted panel used by every full-screen overlay (game over, pause,
 * menus) so the glass treatment stays identical across the app.
 */
export function GlassCard({ children, className = '', tone = 'neutral' }: GlassCardProps) {
  const border = tone === 'primary' ? 'border-snake-500/30' : 'border-surface-700/60'
  const glow =
    tone === 'primary' ? 'shadow-[0_0_48px_rgba(16,185,129,0.18)]' : 'shadow-2xl'
  return (
    <div
      className={`rounded-3xl border ${border} bg-surface-900/80 backdrop-blur-xl ${glow} ${className}`}
    >
      {children}
    </div>
  )
}

/** Consistent dimmed scrim behind overlay panels. */
export const SCRIM = 'absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-md'