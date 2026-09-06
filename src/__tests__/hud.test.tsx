import { describe, expect, it, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { HUD } from '../components/HUD.tsx'
import type { ActiveEffects } from '../hooks/useSnakeGame.ts'

const POWERUP_SLOW_DURATION_MS = 8000
const POWERUP_DOUBLE_DURATION_MS = 8000

function renderHUD(overrides = {}) {
  return render(<HUD
    score={42}
    length={10}
    highScore={99}
    muted={false}
    combo={3}
    activeEffects={{ slow: false, double: false, shield: false } as ActiveEffects}
    slowMs={POWERUP_SLOW_DURATION_MS}
    slowUntil={0}
    doubleMs={POWERUP_DOUBLE_DURATION_MS}
    doubleUntil={0}
    onToggleMute={vi.fn()}
    onPause={vi.fn()}
    showPause={true}
    paused={false}
    {...overrides}
  />)
}

describe('HUD', () => {
  it('renders score, length, best', () => {
    renderHUD()
    expect(screen.getByText('Skor')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Panjang')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Best')).toBeInTheDocument()
    expect(screen.getByText('99')).toBeInTheDocument()
  })

  it('shows mute button with correct aria-label', () => {
    renderHUD()
    const muteBtn = screen.getByRole('button', { name: /Matikan suara/i })
    expect(muteBtn).toBeInTheDocument()
  })

  it('shows pause button when showPause', () => {
    renderHUD()
    expect(screen.getByRole('button', { name: /Jeda/i })).toBeInTheDocument()
  })

  it('hides pause button when not showPause', () => {
    renderHUD({ showPause: false })
    expect(screen.queryByRole('button', { name: /Jeda/i })).not.toBeInTheDocument()
  })

  it('shows combo chip when combo >= 2', () => {
    renderHUD({ combo: 3 })
    expect(screen.getByText('🔥 ×3')).toBeInTheDocument()
  })

  it('hides combo chip when combo < 2', () => {
    renderHUD({ combo: 1 })
    expect(screen.queryByText(/🔥/)).not.toBeInTheDocument()
  })

  it('renders shield chip inactive by default', () => {
    renderHUD()
    const shieldChip = screen.getByTitle('Tameng siap menahan satu hantaman')
    expect(shieldChip).toHaveClass('opacity-40')
  })

  it('shows slow chip with drain bar when active', () => {
    renderHUD({ activeEffects: { slow: true, double: false, shield: false }, slowUntil: Date.now() + POWERUP_SLOW_DURATION_MS })
    const slowChip = screen.getByTitle('Waktu melambat')
    expect(slowChip).not.toHaveClass('opacity-40')
    const bar = slowChip.querySelector('.effect-bar')
    expect(bar).toBeInTheDocument()
    expect(bar).toHaveAttribute('style', expect.stringContaining('animation-duration'))
  })

  it('shows double chip with drain bar when active', () => {
    renderHUD({ activeEffects: { slow: false, double: true, shield: false }, doubleUntil: Date.now() + POWERUP_DOUBLE_DURATION_MS })
    const doubleChip = screen.getByTitle('Skor 2×')
    expect(doubleChip).not.toHaveClass('opacity-40')
    const bar = doubleChip.querySelector('.effect-bar')
    expect(bar).toBeInTheDocument()
  })

  it('restarts drain bar (new key) when until changes for slow', () => {
    const { rerender } = renderHUD({ activeEffects: { slow: true, double: false, shield: false }, slowUntil: 1000 })
    const bar1 = screen.getByTitle('Waktu melambat').querySelector('.effect-bar')
    expect(bar1).toBeInTheDocument()

    act(() => {
      rerender(<HUD
        score={42}
        length={10}
        highScore={99}
        muted={false}
        combo={3}
        activeEffects={{ slow: true, double: false, shield: false } as ActiveEffects}
        slowMs={POWERUP_SLOW_DURATION_MS}
        slowUntil={2000}
        doubleMs={POWERUP_DOUBLE_DURATION_MS}
        doubleUntil={0}
        onToggleMute={vi.fn()}
        onPause={vi.fn()}
        showPause={true}
        paused={false}
      />)
    })

    const bar2 = screen.getByTitle('Waktu melambat').querySelector('.effect-bar')
    expect(bar2).toBeInTheDocument()
    expect(bar2).not.toBe(bar1)
  })

  it('restarts drain bar (new key) when until changes for double', () => {
    const { rerender } = renderHUD({ activeEffects: { slow: false, double: true, shield: false }, doubleUntil: 1000 })
    const bar1 = screen.getByTitle('Skor 2×').querySelector('.effect-bar')
    expect(bar1).toBeInTheDocument()

    act(() => {
      rerender(<HUD
        score={42}
        length={10}
        highScore={99}
        muted={false}
        combo={3}
        activeEffects={{ slow: false, double: true, shield: false } as ActiveEffects}
        slowMs={POWERUP_SLOW_DURATION_MS}
        slowUntil={0}
        doubleMs={POWERUP_DOUBLE_DURATION_MS}
        doubleUntil={2000}
        onToggleMute={vi.fn()}
        onPause={vi.fn()}
        showPause={true}
        paused={false}
      />)
    })

    const bar2 = screen.getByTitle('Skor 2×').querySelector('.effect-bar')
    expect(bar2).toBeInTheDocument()
    expect(bar2).not.toBe(bar1)
  })

  it('pauses drain bar animation when paused=true', () => {
    renderHUD({ activeEffects: { slow: true, double: false, shield: false }, slowUntil: Date.now() + POWERUP_SLOW_DURATION_MS, paused: true })
    const bar = screen.getByTitle('Waktu melambat').querySelector('.effect-bar') as HTMLElement
    expect(bar.style.animationPlayState).toBe('paused')
  })

  it('runs drain bar animation when paused=false', () => {
    renderHUD({ activeEffects: { slow: true, double: false, shield: false }, slowUntil: Date.now() + POWERUP_SLOW_DURATION_MS, paused: false })
    const bar = screen.getByTitle('Waktu melambat').querySelector('.effect-bar') as HTMLElement
    expect(bar.style.animationPlayState).toBe('running')
  })
})