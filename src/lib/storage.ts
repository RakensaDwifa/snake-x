import { STORAGE_KEY } from '../core/constants.ts'

export function loadHighScore(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const value = raw === null ? 0 : Number.parseInt(raw, 10)
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

export function saveHighScore(score: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(score))
  } catch {
    // storage unavailable (private mode / quota) — fail silently
  }
}

export function bestOf(current: number, candidate: number): number {
  return Math.max(current, candidate)
}
