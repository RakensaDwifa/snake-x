import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders as render, screen } from './testUtils.tsx'
import { PauseScreen } from '../components/screens/PauseScreen.tsx'
import { SplashScreen } from '../components/screens/SplashScreen.tsx'

describe('PauseScreen', () => {
  it('shows the pause heading and hint', () => {
    render(<PauseScreen onResume={vi.fn()} onRestart={vi.fn()} onMenu={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /Jeda/i })).toBeInTheDocument()
    expect(screen.getByText(/ular menunggumu/i)).toBeInTheDocument()
  })

  it('calls each handler', () => {
    const onResume = vi.fn()
    const onRestart = vi.fn()
    const onMenu = vi.fn()
    render(<PauseScreen onResume={onResume} onRestart={onRestart} onMenu={onMenu} />)
    screen.getByRole('button', { name: /Lanjut/i }).click()
    screen.getByRole('button', { name: /Mulai Ulang/i }).click()
    screen.getByRole('button', { name: /^Menu$/i }).click()
    expect(onResume).toHaveBeenCalledTimes(1)
    expect(onRestart).toHaveBeenCalledTimes(1)
    expect(onMenu).toHaveBeenCalledTimes(1)
  })

  it('gives resume the primary visual weight', () => {
    render(<PauseScreen onResume={vi.fn()} onRestart={vi.fn()} onMenu={vi.fn()} />)
    const resume = screen.getByRole('button', { name: /Lanjut/i })
    const menu = screen.getByRole('button', { name: /^Menu$/i })
    expect(resume.className).toMatch(/bg-snake-500/)
    expect(resume.className).toMatch(/w-full/)
    expect(menu.className).not.toMatch(/bg-snake-500/)
  })
})

describe('SplashScreen', () => {
  it('renders the title and continue CTA', () => {
    render(<SplashScreen onContinue={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /SNAKE X/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lanjut/i })).toBeInTheDocument()
  })

  it('calls onContinue when clicked', () => {
    const onContinue = vi.fn()
    render(<SplashScreen onContinue={onContinue} />)
    screen.getByRole('button', { name: /Lanjut/i }).click()
    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('uses a full-width CTA', () => {
    render(<SplashScreen onContinue={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Lanjut/i }).className).toMatch(/w-full/)
  })
})