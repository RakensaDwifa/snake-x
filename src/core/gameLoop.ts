const MAX_FRAME_MS = 100

/**
 * Minimal reusable frame engine: advances logic in fixed ticks (accumulator)
 * and calls render every frame with the current tick interpolation (0..1)
 * so the visual layer can smoothly lerp between logical states.
 */
export class GameLoop {
  private rafId: number | null = null
  private lastTime = 0
  private acc = 0
  private _tickMs: number
  private readonly updateFn: () => void
  private readonly renderFn: (interp: number) => void

  constructor(tickMs: number, updateFn: () => void, renderFn: (interp: number) => void) {
    this._tickMs = tickMs
    this.updateFn = updateFn
    this.renderFn = renderFn
  }

  get tickMs(): number {
    return this._tickMs
  }

  get running(): boolean {
    return this.rafId !== null
  }

  setTickMs(ms: number): void {
    this._tickMs = ms
  }

  start(): void {
    if (this.running) return
    this.lastTime = performance.now()
    const loop = (now: number) => {
      this.rafId = requestAnimationFrame(loop)
      const dt = Math.min(now - this.lastTime, MAX_FRAME_MS)
      this.lastTime = now
      this.acc += dt

      while (this.acc >= this._tickMs) {
        this.acc -= this._tickMs
        this.updateFn()
      }

      const interp = Math.min(this.acc / this._tickMs, 1)
      this.renderFn(interp)
    }
    this.rafId = requestAnimationFrame(loop)
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.acc = 0
  }
}
