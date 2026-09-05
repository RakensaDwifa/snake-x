import type { Direction } from '../types/game.ts'
import { GRID_SIZE } from '../core/constants.ts'

interface ControlButtonProps {
  label: string
  onTap: () => void
  variant?: 'direction' | 'action'
}

function ControlButton({ label, onTap, variant = 'direction' }: ControlButtonProps) {
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault()
        onTap()
      }}
      className={
        variant === 'action'
          ? 'flex h-12 flex-1 items-center justify-center rounded-2xl border border-snake-500/40 bg-snake-500/10 font-semibold text-snake-300 active:scale-95'
          : 'flex h-14 w-14 items-center justify-center rounded-2xl border border-snake-500/30 bg-surface-900 text-2xl text-snake-300 active:scale-90'
      }
    >
      {label}
    </button>
  )
}

interface ControlsProps {
  onChangeDirection?: (d: Direction) => void
  onPause?: () => void
  onResume?: () => void
  paused?: boolean
}

export function Controls({ onChangeDirection, onPause, onResume, paused }: ControlsProps) {
  if (!onChangeDirection) return null

  return (
    <div className="mt-4 flex items-end justify-between gap-4">
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <ControlButton label="▲" onTap={() => onChangeDirection('UP')} />
          <div className="flex gap-1.5">
            <ControlButton label="◀" onTap={() => onChangeDirection('LEFT')} />
            <ControlButton label="▶" onTap={() => onChangeDirection('RIGHT')} />
          </div>
          <ControlButton label="▼" onTap={() => onChangeDirection('DOWN')} />
        </div>
      </div>

      <ControlButton
        label={paused ? '▶' : '⏸'}
        variant="action"
        onTap={paused ? (onResume ?? (() => {})) : (onPause ?? (() => {}))}
      />

      <div className="w-24 text-center text-[11px] leading-tight text-slate-500">
        Grid {GRID_SIZE}×{GRID_SIZE} · geser atau panah
      </div>
    </div>
  )
}
