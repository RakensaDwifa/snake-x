import { useCallback, useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { GRID_SIZE } from '../core/constants.ts'
import { shakeOffset, updateFloats, updateParticles } from './particles.ts'
import type { FloatText, Particle } from './particles.ts'
import type { Position, PowerUp } from '../types/game.ts'

export interface BoardRendererProps {
  snakeRef: MutableRefObject<Position[]>
  prevSnakeRef: MutableRefObject<Position[]>
  foodRef: MutableRefObject<Position | null>
  flashRef: MutableRefObject<number>
  shakeRef: MutableRefObject<number>
  particlesRef: MutableRefObject<Particle[]>
  floatsRef: MutableRefObject<FloatText[]>
  powerUpsRef: MutableRefObject<PowerUp[]>
  onReady: (draw: (interp: number) => void) => void
}

/**
 * React wrapper around an HTML5 canvas that draws the board at 60fps. All game
 * data is read from refs (no re-renders), and drawing is driven by the game
 * loop's render callback with an interpolation value so the snake glides
 * smoothly between grid cells.
 */
export function BoardRenderer({
  snakeRef,
  prevSnakeRef,
  foodRef,
  flashRef,
  shakeRef,
  particlesRef,
  floatsRef,
  powerUpsRef,
  onReady,
}: BoardRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const onReadyRef = useRef(onReady)
  const lastRenderRef = useRef(0)
  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  const drawBoard = useCallback(
    (interp: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const now = performance.now()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height || width
      const targetWidth = Math.round(width * dpr)
      const targetHeight = Math.round(height * dpr)
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth
        canvas.height = targetHeight
      }

      const frameDt = lastRenderRef.current === 0 ? 0 : now - lastRenderRef.current
      lastRenderRef.current = now

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!reduced) {
        particlesRef.current = updateParticles(particlesRef.current, frameDt)
        floatsRef.current = updateFloats(floatsRef.current, frameDt)
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!reduced) {
        const { dx, dy } = shakeOffset(now, shakeRef.current)
        ctx.translate(dx, dy)
      }

      const cell = width / GRID_SIZE
      const gap = Math.max(0.5, cell * 0.06)

      ctx.clearRect(0, 0, width, height)
      drawGrid(ctx, width, height, cell)

      const foodCell = foodRef.current
      if (foodCell) {
        drawFood(ctx, foodCell, cell, now)
      }

      for (const powerUp of powerUpsRef.current) {
        drawPowerUp(ctx, powerUp, cell, now)
      }

      const cur = snakeRef.current
      const prev = prevSnakeRef.current
      const flashing = now - flashRef.current < 300

      for (let i = 0; i < cur.length; i++) {
        const curr = cur[i]
        const old = prev[i] ?? curr
        const px = lerp(old.x, curr.x, interp) * cell + gap / 2
        const py = lerp(old.y, curr.y, interp) * cell + gap / 2
        drawSegment(ctx, px, py, cell - gap, i, cur.length, flashing && i === 0)
      }

      if (!reduced) {
        drawParticles(ctx, particlesRef.current, cell)
        drawFloats(ctx, floatsRef.current, cell)
      }
    },
    [flashRef, floatsRef, foodRef, particlesRef, powerUpsRef, prevSnakeRef, shakeRef, snakeRef],
  )

  useEffect(() => {
    onReadyRef.current(drawBoard)
  }, [drawBoard])

  return <canvas ref={canvasRef} className="h-full w-full" />
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, cell: number) {
  ctx.fillStyle = 'rgba(11, 18, 32, 0.85)'
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)'
  ctx.lineWidth = 1
  for (let i = 1; i < GRID_SIZE; i++) {
    const pos = i * cell
    ctx.beginPath()
    ctx.moveTo(pos, 0)
    ctx.lineTo(pos, height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, pos)
    ctx.lineTo(width, pos)
    ctx.stroke()
  }
}

function drawSegment(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  index: number,
  length: number,
  headFlash: boolean,
) {
  const ratio = Math.min(1, index / Math.max(1, length - 1))
  const isHead = index === 0

  const r = Math.round(lerp(34, 6, ratio))
  const g = Math.round(lerp(197, 94, ratio))
  const b = Math.round(lerp(94, 52, ratio))

  if (isHead) {
    ctx.shadowColor = 'rgba(52, 211, 153, 0.9)'
    ctx.shadowBlur = 14
  }
  ctx.fillStyle = headFlash ? 'rgba(244, 63, 94, 0.9)' : `rgb(${r},${g},${b})`
  roundRect(ctx, x, y, size, size, size * 0.32)
  ctx.fill()
  ctx.shadowBlur = 0

  if (isHead) {
    ctx.fillStyle = 'rgba(236, 253, 245, 0.9)'
    const eyeSize = size * 0.16
    const eyeY = y + size * 0.24
    ctx.beginPath()
    ctx.arc(x + size * 0.34, eyeY, eyeSize, 0, Math.PI * 2)
    ctx.arc(x + size * 0.68, eyeY, eyeSize, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawFood(ctx: CanvasRenderingContext2D, food: Position, cell: number, now: number) {
  const pulse = 1 + Math.sin(now / 300) * 0.08
  const size = cell * 0.62 * pulse
  const x = food.x * cell + (cell - size) / 2
  const y = food.y * cell + (cell - size) / 2

  ctx.shadowColor = 'rgba(244, 63, 94, 0.9)'
  ctx.shadowBlur = 16
  ctx.fillStyle = '#f43f5e'
  roundRect(ctx, x, y, size, size, size * 0.3)
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.beginPath()
  ctx.arc(x + size * 0.3, y + size * 0.3, size * 0.12, 0, Math.PI * 2)
  ctx.fill()
}

function drawPowerUp(ctx: CanvasRenderingContext2D, powerUp: PowerUp, cell: number, now: number) {
  const cx = (powerUp.pos.x + 0.5) * cell
  const cy = (powerUp.pos.y + 0.5) * cell

  const pulse = 1 + Math.sin(now / 220) * 0.12
  const halo = cell * 0.85 * pulse
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, halo)
  gradient.addColorStop(0, 'rgba(167, 139, 250, 0.55)')
  gradient.addColorStop(1, 'rgba(167, 139, 250, 0)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(cx, cy, halo, 0, Math.PI * 2)
  ctx.fill()

  const size = cell * 0.5
  ctx.shadowColor = 'rgba(167, 139, 250, 0.95)'
  ctx.shadowBlur = 14
  drawStar(ctx, cx, cy, size)
  ctx.shadowBlur = 0

  ctx.fillStyle = 'rgba(250, 245, 255, 0.95)'
  ctx.font = `bold ${Math.round(cell * 0.3)}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('SLOW', cx, cy + size * 1.4)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
) {
  const innerRadius = outerRadius * 0.45
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = '#a78bfa'
  ctx.fill()
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], cell: number) {
  for (const p of particles) {
    const lifeRatio = p.age / p.duration
    const alpha = Math.max(0, 1 - lifeRatio)
    ctx.globalAlpha = alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x * cell, p.y * cell, p.size * cell * (1 - lifeRatio * 0.5), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawFloats(ctx: CanvasRenderingContext2D, floats: FloatText[], cell: number) {
  ctx.font = `bold ${Math.round(cell * 0.9)}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const f of floats) {
    const ratio = f.age / f.duration
    const x = f.x * cell
    const y = f.y * cell - ratio * cell * 1.2
    ctx.globalAlpha = Math.max(0, 1 - ratio)
    ctx.fillStyle = '#6ee7b7'
    ctx.fillText(f.text, x, y)
  }
  ctx.globalAlpha = 1
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}