import { describe, expect, it } from 'vitest'
import {
  EAT_COLORS,
  shakeOffset,
  spawnBurst,
  spawnFloat,
  updateFloats,
  updateParticles,
} from '../render/particles.ts'

describe('spawnBurst', () => {
  it('spawns the requested number of particles around the point', () => {
    const particles = spawnBurst(2, 3, { count: 8 })
    expect(particles).toHaveLength(8)
    for (const p of particles) {
      expect(p.x).toBe(2)
      expect(p.y).toBe(3)
      expect(p.age).toBe(0)
      expect(typeof p.vx).toBe('number')
      expect(typeof p.vy).toBe('number')
      expect(EAT_COLORS).toContain(p.color)
    }
  })

  it('honours custom colors', () => {
    const colors = ['#ff0000']
    const particles = spawnBurst(0, 0, { count: 5, colors })
    expect(particles.every((p) => p.color === '#ff0000')).toBe(true)
  })
})

describe('updateParticles', () => {
  it('advances velocity under gravity and drops expired particles', () => {
    const particles = spawnBurst(0, 0, { count: 1, speed: 10, duration: 100, gravity: 100 })
    const first = particles[0]
    const beforeVy = first.vy
    const alive = updateParticles(particles, 16)
    expect(alive).toContain(first)
    expect(first.age).toBe(16)
    expect(first.vy).toBeGreaterThan(beforeVy)
    expect(first.x).not.toBe(0)
  })

  it('removes particles past their duration', () => {
    const particles = spawnBurst(0, 0, { count: 1, duration: 50 })
    const expired = updateParticles(particles, 120)
    expect(expired).toHaveLength(0)
  })
})

describe('floats', () => {
  it('spawns a float and ages it out', () => {
    const f = spawnFloat(1, 1, '+1', 100)
    expect(f.text).toBe('+1')
    expect(updateFloats([f], 60)).toHaveLength(1)
    expect(updateFloats([f], 60)).toHaveLength(0)
  })
})

describe('shakeOffset', () => {
  it('returns zero when no shake is active', () => {
    expect(shakeOffset(1000, 0)).toEqual({ dx: 0, dy: 0 })
    expect(shakeOffset(1000, 800, 4, 130)).toEqual({ dx: 0, dy: 0 })
  })

  it('produces decaying offsets during the shake window', () => {
    const near = shakeOffset(900, 880, 4, 130)
    const far = shakeOffset(999, 880, 4, 130)
    const nearMag = Math.hypot(near.dx, near.dy)
    const farMag = Math.hypot(far.dx, far.dy)
    expect(nearMag).toBeGreaterThan(0)
    expect(farMag).toBeLessThan(nearMag)
    expect(nearMag).toBeLessThanOrEqual(4)
  })
})