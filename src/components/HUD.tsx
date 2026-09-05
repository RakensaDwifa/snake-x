interface HUDProps {
  score: number
  length: number
  highScore: number
  muted: boolean
  onToggleMute: () => void
  onPause: () => void
  showPause: boolean
}

export function HUD({
  score,
  length,
  highScore,
  muted,
  onToggleMute,
  onPause,
  showPause,
}: HUDProps) {
  return (
    <div className="mb-3 flex w-full max-w-md items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-surface-800 bg-surface-900/60 px-3 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Skor</div>
          <div className="font-display text-lg font-bold text-snake-300">{score}</div>
        </div>
        <div className="rounded-xl border border-surface-800 bg-surface-900/60 px-3 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Panjang</div>
          <div className="font-display text-lg font-bold text-slate-200">{length}</div>
        </div>
        <div className="rounded-xl border border-surface-800 bg-surface-900/60 px-3 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Best</div>
          <div className="font-display text-lg font-bold text-amber-300">{highScore}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onToggleMute}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-800 bg-surface-900/60 text-slate-300 active:scale-90"
          aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        {showPause && (
          <button
            type="button"
            onClick={onPause}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-800 bg-surface-900/60 text-snake-300 active:scale-90"
            aria-label="Jeda"
          >
            ⏸
          </button>
        )}
      </div>
    </div>
  )
}
