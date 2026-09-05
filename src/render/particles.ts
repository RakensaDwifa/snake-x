export const EAT_COLORS = ['#34d399', '#6ee7b7', '#a7f3d0']
export const DEATH_COLORS = ['#f43f5e', '#fb7185', '#fda4af']
export const POWERUP_COLORS = ['#a78bfa', '#c084fc', '#f0abfc']
export const CONFETTI_COLORS = ['#34d399', '#6ee7b7', '#fbbf24', '#fb7185', '#a78bfa', '#38bdf8']

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  duration: number
  size: number
  color: string
  gravity: number
}

export interface FloatText {
  x: number
  y: number
  text: string
  age: number
  duration: number
}

interface BurstOptions {
  count?: number
  colors?: string[]
  speed?: number
  size?: number
  duration?: number
  gravity?: number
}

/**
 * Spawn a ring/cloud of particles around (x, y). Coordinates are in grid-cell
 * units; velocities are in cells per second — the renderer scales to pixels.
 */
export function spawnBurst(x: number, y: number, options: BurstOptions = {}): Particle[] {
  const {
    count = 14,
    colors = EAT_COLORS,
    speed = 5,
    size = 0.3,
    duration = 450,
    gravity = 6,
  } = options

  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const magnitude = speed * (0.35 + Math.random() * 0.75)
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * magnitude,
      vy: Math.sin(angle) * magnitude,
      age: 0,
      duration: duration * (0.6 + Math.random() * 0.4),
      size: size * (0.7 + Math.random() * 0.6),
      color: colors[Math.floor(Math.random() * colors.length)],
      gravity,
    })
  }
  return particles
}

/**
 * Advance particles by dt (ms) and drop expired ones. Mutates in place.
 */
export function updateParticles(particles: Particle[], dt: number): Particle[] {
  const dtSec = dt / 1000
  const alive: Particle[] = []
  for (const p of particles) {
    p.age += dt
    if (p.age >= p.duration) continue
    p.vy += p.gravity * dtSec
    p.x += p.vx * dtSec
    p.y += p.vy * dtSec
    alive.push(p)
  }
  return alive
}

export function spawnFloat(x: number, y: number, text: string, duration = 700): FloatText {
  return { x, y, text, age: 0, duration }
}

export function updateFloats(floats: FloatText[], dt: number): FloatText[] {
  return floats.filter((f) => {
    f.age += dt
    return f.age < f.duration
  })
}

/**
 * Deterministic per-frame shake offset in pixels for a shake started at
 * `shakeAt` (ms timestamp). Returns { dx, dy } within `amplitude`, decaying
 * over `duration`; zero when the shake has finished.
 */
export function shakeOffset(
  now: number,
  shakeAt: number,
  amplitude = 4,
  duration = 130,
): { dx: number; dy: number } {
  const elapsed = now - shakeAt
  if (elapsed < 0 || elapsed >= duration) return { dx: 0, dy: 0 }
  const decay = 1 - elapsed / duration
  return {
    dx: (Math.random() * 2 - 1) * amplitude * decay,
    dy: (Math.random() * 2 - 1) * amplitude * decay,
  }
}