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
  currency: { coins: 5000, totalEarned: 5000, totalSpent: 0 },
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
  onPurchase: vi.fn(),
  onSelectSkin: vi.fn(),
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

  it('renders the coin balance', () => {
    render(<MenuScreen {...defaultProps} currency={{ coins: 1234, totalEarned: 1234, totalSpent: 0 }} />)
    expect(screen.getByText('1.234')).toBeInTheDocument()
  })

  it('exposes a full-width start CTA', () => {
    render(<MenuScreen {...defaultProps} />)
    const start = screen.getByRole('button', { name: /Mulai Main/i })
    expect(start.className).toMatch(/w-full/)
    expect(start.className).toMatch(/text-lg/)
  })

  it('forwards a purchase to the parent handler', () => {
    const onPurchase = vi.fn().mockReturnValue(true)
    render(<MenuScreen {...defaultProps} currency={{ coins: 5000, totalEarned: 5000, totalSpent: 0 }} onPurchase={onPurchase} />)
    fireEvent.click(screen.getByRole('button', { name: /Shop/i }))
    fireEvent.click(screen.getByText('Cyberpunk').closest('div.rounded-xl')!.querySelector('button')!)
    expect(onPurchase).toHaveBeenCalledWith('skin_cyberpunk')
  })

  it('shows a success notice when a purchase succeeds', () => {
    const onPurchase = vi.fn().mockReturnValue(true)
    render(<MenuScreen {...defaultProps} currency={{ coins: 5000, totalEarned: 5000, totalSpent: 0 }} onPurchase={onPurchase} />)
    fireEvent.click(screen.getByRole('button', { name: /Shop/i }))
    fireEvent.click(screen.getByText('Cyberpunk').closest('div.rounded-xl')!.querySelector('button')!)
    expect(screen.getByRole('status')).toHaveTextContent(/Berhasil dibeli/i)
  })

  it('shows a failure notice when coins are insufficient', () => {
    const onPurchase = vi.fn().mockReturnValue(false)
    render(<MenuScreen {...defaultProps} currency={{ coins: 5000, totalEarned: 5000, totalSpent: 0 }} onPurchase={onPurchase} />)
    fireEvent.click(screen.getByRole('button', { name: /Shop/i }))
    fireEvent.click(screen.getByText('Cyberpunk').closest('div.rounded-xl')!.querySelector('button')!)
    expect(screen.getByRole('status')).toHaveTextContent(/Koin tidak cukup/i)
  })

  it('forwards skin selection to the parent handler', () => {
    const onSelectSkin = vi.fn()
    const props = {
      ...defaultProps,
      onSelectSkin,
      inventory: {
        ...defaultProps.inventory,
        skins: {
          skin_classic_green: { unlocked: true, source: 'level' },
          skin_neon: { unlocked: true, source: 'level' },
        },
      },
    }
    render(<MenuScreen {...props} />)
    fireEvent.click(screen.getByRole('button', { name: /Skin/i }))
    fireEvent.click(screen.getByRole('button', { name: /Neon Glow/i }))
    expect(onSelectSkin).toHaveBeenCalledWith('skin_neon')
  })

  it('does not render a blocking modal layer while every panel is closed', () => {
    // Regression: an always-mounted full-screen overlay sat above the menu and
    // swallowed every click, so "Mulai Main" could not be pressed.
    const { container } = render(<MenuScreen {...defaultProps} />)
    expect(container.querySelector('.absolute.inset-0.z-10')).toBeNull()
  })

  it('mounts the modal layer once a panel is opened', () => {
    const { container } = render(<MenuScreen {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Statistik/i }))
    expect(container.querySelector('.absolute.inset-0.z-10')).not.toBeNull()
  })
})
