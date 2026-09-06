import { loadMusicOn, saveMusicOn } from '../lib/storage.ts'
import { getMasterGain, getSharedContext, isMuted } from './sfx.ts'

const BASE_STEP_MS = 280
const LOOP_STEPS = 16
const HORIZON_MS = 500

const BASS = [45, 45, 40, 45, 43, 45, 40, 38, 45, 45, 40, 45, 43, 45, 47, 45]
const ARP = [0, 0, 69, 0, 0, 72, 0, 69, 0, 0, 0, 74, 72, 0, 76, 0]

let timer: ReturnType<typeof setInterval> | null = null
let nextStepAt = 0
let stepIndex = 0
let musicOn = loadMusicOn()
let currentStepMs = BASE_STEP_MS

function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}

function scheduleStep(step: number, at: number): void {
  const ctx = getSharedContext()
  const master = getMasterGain()
  if (!ctx || !master) return

  const bass = BASS[step]
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(midiToFreq(bass), at)
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(0.14, at + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.24)
  osc.connect(gain).connect(master)
  osc.start(at)
  osc.stop(at + 0.26)

  const arp = ARP[step]
  if (arp > 0) {
    const o2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    o2.type = 'square'
    o2.frequency.setValueAtTime(midiToFreq(arp), at)
    g2.gain.setValueAtTime(0.0001, at)
    g2.gain.exponentialRampToValueAtTime(0.03, at + 0.01)
    g2.gain.exponentialRampToValueAtTime(0.0001, at + 0.12)
    o2.connect(g2).connect(master)
    o2.start(at)
    o2.stop(at + 0.13)
  }
}

function tick(): void {
  const ctx = getSharedContext()
  if (!ctx) return
  const horizon = ctx.currentTime + HORIZON_MS / 1000
  while (nextStepAt < horizon) {
    if (musicOn && !isMuted()) scheduleStep(stepIndex, nextStepAt)
    nextStepAt += currentStepMs / 1000
    stepIndex = (stepIndex + 1) % LOOP_STEPS
  }
}

/** Starts (or restarts) the looping groove. Idempotent. */
export function startMusic(): void {
  if (timer !== null) return
  const ctx = getSharedContext()
  if (!ctx) return
  nextStepAt = ctx.currentTime + 0.05
  stepIndex = 0
  timer = setInterval(tick, 100)
}

export function stopMusic(): void {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

export function isMusicOn(): boolean {
  return musicOn
}

export function toggleMusic(): boolean {
  musicOn = !musicOn
  saveMusicOn(musicOn)
  if (musicOn) startMusic()
  return musicOn
}

/** Set music intensity (0-1) based on score. 0 = normal, 1 = 2x speed. */
export function setIntensity(intensity: number): void {
  const clamped = Math.min(1, Math.max(0, intensity))
  currentStepMs = Math.round(BASE_STEP_MS * (1 - clamped * 0.4))
}