const MUTE_KEY = 'snake-x-muted'

let ctx: AudioContext | null = null
let muted = loadMute()

function loadMute(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function persistMute(): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    // ignore
  }
}

/** Must be called from a user gesture (autoplay policy on mobile). */
export function unlockAudio(): void {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume()
    return
  }
  try {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      ctx = new AudioContext()
    }
  } catch {
    ctx = null
  }
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(value: boolean): void {
  muted = value
  persistMute()
}

let lastNoteAt = 0

function blip(
  frequency: number,
  duration: number,
  type: OscillatorType,
  volume = 0.08,
  delayMs = 0,
): void {
  if (muted || !ctx) return
  const now = ctx.currentTime
  const start = now + delayMs / 1000
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration / 1000)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration / 1000 + 0.02)
}

function debounceNote(): boolean {
  const now = performance.now()
  if (now - lastNoteAt < 60) return true
  lastNoteAt = now
  return false
}

export const sfx = {
  eat(): void {
    if (debounceNote()) return
    blip(440, 90, 'square', 0.07)
    blip(660, 120, 'square', 0.06, 60)
  },
  turn(): void {
    if (debounceNote()) return
    blip(300, 45, 'triangle', 0.02)
  },
  start(): void {
    blip(330, 80, 'triangle', 0.07)
    blip(440, 80, 'triangle', 0.07, 80)
    blip(550, 140, 'triangle', 0.08, 160)
  },
  pause(): void {
    blip(220, 70, 'sine', 0.05)
    blip(220, 70, 'sine', 0.05, 110)
  },
  resume(): void {
    blip(330, 70, 'sine', 0.05)
    blip(440, 70, 'sine', 0.05, 100)
  },
  death(): void {
    blip(440, 200, 'sawtooth', 0.07)
    blip(330, 220, 'sawtooth', 0.07, 140)
    blip(220, 320, 'sawtooth', 0.08, 320)
  },
  highScore(): void {
    blip(523, 90, 'triangle', 0.07)
    blip(659, 90, 'triangle', 0.07, 90)
    blip(784, 90, 'triangle', 0.07, 180)
    blip(1046, 200, 'triangle', 0.08, 270)
  },
  powerUp(): void {
    if (debounceNote()) return
    blip(880, 70, 'sine', 0.07)
    blip(1174, 120, 'sine', 0.07, 70)
  },
}
