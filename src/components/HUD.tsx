import type { ReactNode } from 'react'
import type { ActiveEffects } from '../hooks/useSnakeGame.ts'
import { useLocale } from '../lib/locale.tsx'

interface HUDProps {
  score: number
  length: number
  highScore: number
  muted: boolean
  combo: number
  activeEffects: ActiveEffects
  slowMs: number
  slowUntil: number
  doubleMs: number
  doubleUntil: number
  onToggleMute: () => void
  onPause: () => void
  showPause: boolean
  paused: boolean
}

interface EffectChipProps {
  active: boolean
  until: number
  ms: number
  color: string
  colorBar: string
  title: string
  children: ReactNode
  paused: boolean
}

function EffectChip({ active, until, ms, color, colorBar, title, children, paused }: EffectChipProps) {
  const showBar = active && ms > 0
  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-sm transition ${
        active
          ? 'border-slate-700 bg-surface-800/80'
          : 'border-surface-800 bg-surface-950/40 opacity-40'
      }`}
      title={title}
      aria-label={`${title}${active ? ' aktif' : ' nonaktif'}`}
    >
      <span>{children}</span>
      {showBar && (
        <div className="h-1 w-9 overflow-hidden rounded-full bg-surface-950">
          <div
            key={until}
            className={`effect-bar h-full rounded-full ${colorBar}`}
            style={{ animationDuration: `${ms}ms`, animationPlayState: paused ? 'paused' : 'running' }}
          />
        </div>
      )}
      {active && ms > 0 && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${color}`}
          style={{ animation: 'pulse-dot 1s ease-in-out infinite' }}
        />
      )}
    </div>
  )
}

export function HUD({
  score,
  length,
  highScore,
  muted,
  combo,
  activeEffects,
  slowMs,
  slowUntil,
  doubleMs,
  doubleUntil,
  onToggleMute,
  onPause,
  showPause,
  paused,
}: HUDProps) {
  const { t } = useLocale()
  return (
    <div className="mb-3 flex w-full max-w-md flex-col gap-2">
      <div className="flex w-full items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-surface-800 bg-surface-900/60 px-3 py-1.5">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">{t.score}</div>
            <div className="font-display text-lg font-bold text-snake-300">{score}</div>
          </div>
          <div className="rounded-xl border border-surface-800 bg-surface-900/60 px-3 py-1.5">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">{t.length}</div>
            <div className="font-display text-lg font-bold text-slate-200">{length}</div>
          </div>
          <div className="rounded-xl border border-surface-800 bg-surface-900/60 px-3 py-1.5">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">{t.bestLabel}</div>
            <div className="font-display text-lg font-bold text-amber-300">{highScore}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-800 bg-surface-900/60 text-slate-300 active:scale-90"
            aria-label={muted ? t.muteOff : t.muteOn}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {showPause && (
            <button
              type="button"
              onClick={onPause}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-800 bg-surface-900/60 text-snake-300 active:scale-90"
              aria-label={t.paused}
            >
              ⏸
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {combo >= 2 && (
          <div
            className="rounded-lg border border-orange-800 bg-orange-500/15 px-2 py-1 text-sm font-bold text-orange-300"
            title={t.combo.replace('{combo}', String(Math.min(combo, 5)))}
          >
            {t.combo.replace('{combo}', String(Math.min(combo, 5)))}
          </div>
        )}
        <EffectChip
          active={activeEffects.shield}
          until={0}
          ms={0}
          color="bg-sky-400"
          colorBar="bg-sky-400"
          title={t.legend.shield}
          paused={paused}
        >
          🛡️
        </EffectChip>
        <EffectChip
          active={activeEffects.slow}
          until={slowUntil}
          ms={slowMs}
          color="bg-sky-400"
          colorBar="bg-sky-400"
          title={t.legend.slow}
          paused={paused}
        >
          🐢
        </EffectChip>
        <EffectChip
          active={activeEffects.double}
          until={doubleUntil}
          ms={doubleMs}
          color="bg-fuchsia-400"
          colorBar="bg-fuchsia-400"
          title={t.legend.double}
          paused={paused}
        >
          ×2
        </EffectChip>
      </div>
    </div>
  )
}