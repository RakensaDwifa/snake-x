import type { ReactNode } from 'react'
import type { ActiveEffects } from '../hooks/useSnakeGame.ts'
import { useRemainingPercent } from '../hooks/useEffectCountdown.ts'
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
  label: string
  activeLabel: string
  children: ReactNode
  paused: boolean
}

/** Pill-shaped effect chip: icon badge + label + live remaining %, plus drain bar. */
function EffectChip({
  active,
  until,
  ms,
  color,
  colorBar,
  title,
  label,
  activeLabel,
  children,
  paused,
}: EffectChipProps) {
  const hasTimer = active && ms > 0 && until > 0
  const percent = useRemainingPercent(until, ms)
  const showBar = hasTimer

  return (
    <div
      className={`flex flex-col gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
        active
          ? 'border-slate-700 bg-surface-800/80'
          : 'border-surface-800 bg-surface-950/40 opacity-40'
      }`}
      title={title}
      aria-label={`${title}${active ? ' aktif' : ' nonaktif'}`}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
            active ? color : ''
          }`}
        >
          {children}
        </span>
        <span className="font-semibold text-slate-200">{label}</span>
        {hasTimer && (
          <span className="font-display text-[11px] font-bold tabular-nums text-slate-400">
            {percent}%
          </span>
        )}
        {active && !hasTimer && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {activeLabel}
          </span>
        )}
      </div>
      {showBar && (
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-surface-950">
          <div
            key={until}
            className={`effect-bar h-full rounded-full ${colorBar}`}
            style={{ animationDuration: `${ms}ms`, animationPlayState: paused ? 'paused' : 'running' }}
          />
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  accent: string
  badge?: string
}

function StatCard({ label, value, accent, badge }: StatCardProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl border border-surface-700/60 bg-surface-900/70 px-2 py-1.5 backdrop-blur-md shadow-lg">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`font-display text-lg font-bold tabular-nums ${accent}`}>{value}</div>
      {badge && <span className="text-[10px] leading-none">{badge}</span>}
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
  const { t, locale } = useLocale()
  const nf = new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US')
  const fmt = (n: number) => nf.format(n)

  return (
    <div className="mb-3 flex w-full max-w-md flex-col gap-2">
      <div className="flex w-full items-center justify-between gap-3 text-sm">
        <div className="flex flex-1 items-center gap-2">
          <StatCard label={t.score} value={fmt(score)} accent="text-snake-300" />
          <StatCard label={t.length} value={fmt(length)} accent="text-slate-200" />
          <StatCard label={t.bestLabel} value={fmt(highScore)} accent="text-amber-300" badge="🏅" />
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-700/60 bg-surface-900/70 text-slate-300 backdrop-blur-md transition hover:border-slate-500 active:scale-90"
            aria-label={muted ? t.unmuteAction : t.muteAction}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {showPause && (
            <button
              type="button"
              onClick={onPause}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-700/60 bg-surface-900/70 text-snake-300 backdrop-blur-md transition hover:border-snake-500/50 active:scale-90"
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
            className="flex items-center gap-1.5 rounded-full border border-orange-800 bg-orange-500/15 px-2.5 py-1 text-sm font-bold text-orange-300"
            title={t.combo.replace('{combo}', String(Math.min(combo, 5)))}
          >
            <span>🔥</span>
            <span>×{Math.min(combo, 5)}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-400/80">
              {t.comboLabel}
            </span>
          </div>
        )}
        <EffectChip
          active={activeEffects.shield}
          until={0}
          ms={0}
          color="bg-sky-400/30"
          colorBar="bg-sky-400"
          title={t.effectShieldDesc}
          activeLabel={t.effectActive}
          label={t.effectShield}
          paused={paused}
        >
          🛡️
        </EffectChip>
        <EffectChip
          active={activeEffects.slow}
          until={slowUntil}
          ms={slowMs}
          color="bg-purple-400/30"
          colorBar="bg-purple-400"
          title={t.effectSlowDesc}
          activeLabel={t.effectActive}
          label={t.effectSlow}
          paused={paused}
        >
          🐢
        </EffectChip>
        <EffectChip
          active={activeEffects.double}
          until={doubleUntil}
          ms={doubleMs}
          color="bg-fuchsia-400/30"
          colorBar="bg-fuchsia-400"
          title={t.effectDoubleDesc}
          activeLabel={t.effectActive}
          label={t.effectDouble}
          paused={paused}
        >
          ×2
        </EffectChip>
      </div>
    </div>
  )
}