import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders as render, screen, fireEvent } from './testUtils.tsx'
import { MenuScreen } from '../components/screens/MenuScreen.tsx'

const defaultProps = {
  highScore: 100,
  speedMode: 'normal' as const,
  muted: false,
  volume: 0.6,
  musicOn: true,
  wrapMode: false,
  stats: { games: 0, totalFood: 0, maxLength: 0, wins: 0, totalScore: 0, bestCombo: 0, goldEaten: 0, playSeconds: 0 },
  achievements: new Set<string>(),
  progression: { xp: 0, level: 1, xpToNext: 100, streakLogin: 0, streakPlay: 0 },
  currency: { coins: 0, totalEarned: 0, totalSpent: 0 },
  inventory: {
    skins: { skin_classic_green: { unlocked: true, source: 'level' } },
    equippedSkin: 'skin_classic_green',
    powerUpSlots: 1,
    equippedPowerUps: [],
  },
  onSpeed: vi.fn(),
  onStart: vi.fn(),
  onToggleMute: vi.fn(),
  onToggleMusic: vi.fn(),
  onToggleWrap: vi.fn(),
  onVolume: vi.fn(),
}

describe('MenuScreen', () => {
  it('renders title and best score', () => {
    render(<MenuScreen {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /SNAKE X/i })).toBeInTheDocument()
    expect(screen.getByText(/Best: 100/i)).toBeInTheDocument()
  })

  it('shows speed buttons with active selection', () => {
    render(<MenuScreen {...defaultProps} />)
    const normalBtn = screen.getByRole('button', { name: /Normal/i })
    expect(normalBtn).toHaveClass('border-snake-400')
    expect(screen.getByRole('button', { name: /Santai/i })).not.toHaveClass('border-snake-400')
    expect(screen.getByRole('button', { name: /Ngebut/i })).not.toHaveClass('border-snake-400')
  })

  it('calls onSpeed when speed button clicked', () => {
    render(<MenuScreen {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Ngebut/i }))
    expect(defaultProps.onSpeed).toHaveBeenCalledWith('fast')
  })

  it('toggles mute via onToggleMute', () => {
    render(<MenuScreen {...defaultProps} />)
    const muteText = screen.getByText(/suara nyala/i)
    fireEvent.click(muteText)
    expect(defaultProps.onToggleMute).toHaveBeenCalledTimes(1)
  })

  it('toggles music via onToggleMusic', () => {
    render(<MenuScreen {...defaultProps} />)
    const musicSwitch = screen.getByRole('switch', { name: /Musik latar/i })
    fireEvent.click(musicSwitch)
    expect(defaultProps.onToggleMusic).toHaveBeenCalledTimes(1)
  })

  it('toggles wrap via onToggleWrap', () => {
    render(<MenuScreen {...defaultProps} />)
    const wrapSwitch = screen.getByRole('switch', { name: /Mode tembus dinding/i })
    fireEvent.click(wrapSwitch)
    expect(defaultProps.onToggleWrap).toHaveBeenCalledTimes(1)
  })

  it('calls onVolume when slider changes', () => {
    render(<MenuScreen {...defaultProps} />)
    const slider = screen.getByRole('slider', { name: /Volume/i })
    fireEvent.change(slider, { target: { value: '80' } })
    expect(defaultProps.onVolume).toHaveBeenCalledWith(0.8)
  })

  it('calls onStart when Mulai Main clicked', () => {
    render(<MenuScreen {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Mulai Main/i }))
    expect(defaultProps.onStart).toHaveBeenCalledTimes(1)
  })

  it('shows legend text', () => {
    render(<MenuScreen {...defaultProps} />)
    expect(screen.getByText(/melambat/i)).toBeInTheDocument()
    expect(screen.getByText(/skor ganda/i)).toBeInTheDocument()
    expect(screen.getByText(/tameng/i)).toBeInTheDocument()
    expect(screen.getByText(/emas/i)).toBeInTheDocument()
  })
})