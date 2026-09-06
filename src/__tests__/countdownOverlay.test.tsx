import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CountdownOverlay } from '../components/CountdownOverlay.tsx'

describe('CountdownOverlay', () => {
  it('renders nothing when value is null', () => {
    render(<CountdownOverlay value={null} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders 3 when value is 3', () => {
    render(<CountdownOverlay value={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders 2 when value is 2', () => {
    render(<CountdownOverlay value={2} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders 1 when value is 1', () => {
    render(<CountdownOverlay value={1} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders GO! when value is 0', () => {
    render(<CountdownOverlay value={0} />)
    expect(screen.getByText('GO!')).toBeInTheDocument()
  })
})