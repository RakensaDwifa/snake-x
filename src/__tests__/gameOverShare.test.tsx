import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GameOverScreen } from '../components/screens/GameOverScreen.tsx'

const defaultProps = {
  score: 50,
  length: 15,
  highScore: 60,
  stats: { games: 3, totalFood: 100, maxLength: 15, wins: 0, totalScore: 120, bestCombo: 3, goldEaten: 2, playSeconds: 60 },
  newBest: false,
  won: false,
  scores: [
    { score: 60, length: 18, won: false, at: 1000 },
    { score: 50, length: 15, won: false, at: 2000 },
  ],
  onRestart: vi.fn(),
  onMenu: vi.fn(),
}

beforeEach(() => {
  vi.stubGlobal('navigator', {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    share: vi.fn(),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('GameOverScreen share', () => {
  it('renders score, length, best', () => {
    render(<GameOverScreen {...defaultProps} />)
    expect(screen.getByText('💀 Game Over')).toBeInTheDocument()
    expect(screen.getByText('Skor')).toBeInTheDocument()
    // Use specific selectors for score values (50 appears in score card and top-5 list)
    const scoreElements = screen.getAllByText('50')
    expect(scoreElements.length).toBeGreaterThan(0)
    expect(screen.getByText('Panjang')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('Best')).toBeInTheDocument()
    // 60 appears in Best card and top-5 list
    const bestElements = screen.getAllByText('60')
    expect(bestElements.length).toBeGreaterThan(0)
  })

  it('shows top 5 scores when not won', () => {
    render(<GameOverScreen {...defaultProps} />)
    expect(screen.getByText('🏅 Skor Teratas')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    // 60 appears twice - once in Best, once in top 5
    const topScoreElements = screen.getAllByText('60')
    expect(topScoreElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('18 seg')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('falls back to clipboard when navigator.share rejects', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      share: vi.fn().mockRejectedValue(new Error('share failed')),
    })

    render(<GameOverScreen {...defaultProps} />)
    const shareBtn = screen.getByRole('button', { name: /Bagikan Skor/i })
    fireEvent.click(shareBtn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Tersalin!/i })).toBeInTheDocument()
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(shareBtn).toBeDisabled()
  })

  it('shows ✅ Tersalin! after successful clipboard fallback', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      share: vi.fn().mockRejectedValue(new Error('share failed')),
    })

    render(<GameOverScreen {...defaultProps} />)
    const shareBtn = screen.getByRole('button', { name: /Bagikan Skor/i })
    fireEvent.click(shareBtn)

    await waitFor(() => {
      expect(shareBtn).toHaveTextContent('✅ Tersalin!')
    })
  })

  it('shows error state when both share and clipboard fail', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('clipboard failed')),
      },
      share: vi.fn().mockRejectedValue(new Error('share failed')),
    })

    render(<GameOverScreen {...defaultProps} />)
    const shareBtn = screen.getByRole('button', { name: /Bagikan Skor/i })
    fireEvent.click(shareBtn)

    await waitFor(() => {
      expect(shareBtn).toHaveTextContent('📋 Bagikan (gagal)')
    })
  })
})