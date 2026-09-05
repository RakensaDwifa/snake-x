import { useCallback, useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { GRID_SIZE } from '../core/constants.ts'
import type { Position } from '../types/game.ts'

export interface BoardRendererProps {
  snakeRef: MutableRefObject<Position[]>
  prevSnakeRef: MutableRefObject<Position[]>
  foodRef: MutableRefObject<Position | null>
  flashRef: MutableRefObject<number>
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
  onReady,
}: BoardRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const onReadyRef = useRef(onReady)
  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  const drawBoard = useCallback(
    (interp: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cell = width / GRID_SIZE
      const gap = Math.max(0.5, cell * 0.06)

      ctx.clearRect(0, 0, width, height)
      drawGrid(ctx, width, height, cell)

      const foodCell = foodRef.current
      if (foodCell) {
        drawFood(ctx, foodCell, cell, performance.now())
      }

      const cur = snakeRef.current
      const prev = prevSnakeRef.current
      const flashing = performance.now() - flashRef.current < 300

      for (let i = 0; i < cur.length; i++) {
        const curr = cur[i]
        const old = prev[i] ?? curr
        const px = lerp(old.x, curr.x, interp) * cell + gap / 2
        const py = lerp(old.y, curr.y, interp) * cell + gap / 2
        drawSegment(ctx, px, py, cell - gap, i, cur.length, flashing && i === 0)
      }
    },
    [flashRef, foodRef, prevSnakeRef, snakeRef],
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
