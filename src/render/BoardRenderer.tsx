import { useCallback, useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { BONUS_FOOD_LIFETIME_MS, GRID_SIZE } from '../core/constants.ts'
import { getSkinColors } from '../core/skins.ts'
import { shakeOffset, updateFloats, updateParticles } from './particles.ts'
import type { FloatText, Particle } from './particles.ts'
import type { Direction, Position, PowerUp, PowerUpKind } from '../types/game.ts'

export interface BoardRendererProps {
  skinId: string
  directionRef: MutableRefObject<Direction>
  snakeRef: MutableRefObject<Position[]>
  prevSnakeRef: MutableRefObject<Position[]>
  foodRef: MutableRefObject<Position | null>
  bonusFoodRef: MutableRefObject<Position | null>
  bonusFoodExpireAtRef: MutableRefObject<number>
  shieldFreezeUntilRef: MutableRefObject<number>
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
  skinId,
  directionRef,
  snakeRef,
  prevSnakeRef,
  foodRef,
  bonusFoodRef,
  bonusFoodExpireAtRef,
  shieldFreezeUntilRef,
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
      const palette = getSkinColors(skinId)

      ctx.clearRect(0, 0, width, height)
      drawGrid(ctx, width, height, cell)
      drawAmbientGlow(ctx, width, height, palette)

      const foodCell = foodRef.current
      if (foodCell) {
        drawFood(ctx, foodCell, cell, now, palette.food)
      }

      const bonusCell = bonusFoodRef.current
      if (bonusCell && bonusFoodExpireAtRef.current > now) {
        drawBonusFood(ctx, bonusCell, cell, now, bonusFoodExpireAtRef.current)
      }

      for (const powerUp of powerUpsRef.current) {
        drawPowerUp(ctx, powerUp, cell, now)
      }

      const cur = snakeRef.current
      const prev = prevSnakeRef.current
      const flashing = now - flashRef.current < 300
      const dir = directionRef.current

      for (let i = 0; i < cur.length; i++) {
        const curr = cur[i]
        const old = prev[i] ?? curr
        const px = lerp(old.x, curr.x, interp) * cell + gap / 2
        const py = lerp(old.y, curr.y, interp) * cell + gap / 2
        drawSegment(ctx, px, py, cell - gap, i, cur.length, flashing && i === 0, palette, dir)
      }

      drawVignette(ctx, width, height)

      if (shieldFreezeUntilRef.current > now) {
        const headCur = cur[0]
        const headPrev = prev[0] ?? headCur
        const hx = lerp(headPrev.x, headCur.x, interp) * cell + cell / 2
        const hy = lerp(headPrev.y, headCur.y, interp) * cell + cell / 2
        drawShieldRing(ctx, hx, hy, cell, now)
      }

      if (!reduced) {
        drawParticles(ctx, particlesRef.current, cell)
        drawFloats(ctx, floatsRef.current, cell)
      }
    },
    [
      bonusFoodExpireAtRef,
      bonusFoodRef,
      directionRef,
      flashRef,
      floatsRef,
      foodRef,
      particlesRef,
      powerUpsRef,
      prevSnakeRef,
      shakeRef,
      shieldFreezeUntilRef,
      skinId,
      snakeRef,
    ],
  )

  useEffect(() => {
    onReadyRef.current(drawBoard)
  }, [drawBoard])

  return <canvas ref={canvasRef} className="h-full w-full" />
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Skin colors resolved from the equipped skin id (falls back to classic). */
interface SkinPalette {
  head: string
  body: string
  tail: string
  food: string
  particles: string[]
}

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace('#', '')
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw
  const n = Number.parseInt(full, 16)
  if (!Number.isFinite(n)) return [255, 255, 255]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

/** Linear blend between two hex colors; `t` 0 = from, 1 = to. */
function mixHex(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from)
  const [r2, g2, b2] = hexToRgb(to)
  const r = Math.round(lerp(r1, r2, t))
  const g = Math.round(lerp(g1, g2, t))
  const b = Math.round(lerp(b1, b2, t))
  return `rgb(${r},${g},${b})`
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
  palette: SkinPalette,
  dir: Direction,
) {
  const ratio = Math.min(1, index / Math.max(1, length - 1))
  const isHead = index === 0

  if (isHead) {
    ctx.shadowColor = withAlpha(palette.head, 0.9)
    ctx.shadowBlur = 14
  }
  ctx.fillStyle = headFlash
    ? 'rgba(244, 63, 94, 0.9)'
    : mixHex(palette.head, palette.tail, ratio)
  roundRect(ctx, x, y, size, size, size * 0.32)
  ctx.fill()
  ctx.shadowBlur = 0

  // Soft top-left highlight gives every segment a rounded, glossy feel.
  if (!headFlash) {
    ctx.save()
    roundRect(ctx, x, y, size, size, size * 0.32)
    ctx.clip()
    const sheen = ctx.createLinearGradient(x, y, x + size, y + size)
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)')
    sheen.addColorStop(0.55, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = sheen
    ctx.fillRect(x, y, size, size)
    ctx.restore()
  }

  if (isHead) {
    drawEyes(ctx, x, y, size, dir, headFlash)
  }
}

/** Two eyes offset toward the direction of travel, with a dark pupil. */
function drawEyes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  dir: Direction,
  headFlash: boolean,
) {
  const forward = size * 0.17
  const side = size * 0.17
  const eyeRadius = size * 0.15
  const pupilRadius = eyeRadius * 0.48

  // Offsets for both eyes, perpendicular pairs swapped for vertical movement.
  const offsets: [number, number][] =
    dir === 'RIGHT'
      ? [
          [0.5 + forward, 0.3 - side],
          [0.5 + forward, 0.3 + side],
        ]
      : dir === 'LEFT'
        ? [
            [0.5 - forward, 0.3 - side],
            [0.5 - forward, 0.3 + side],
          ]
        : dir === 'UP'
          ? [
              [0.5 - side, 0.3 - forward],
              [0.5 + side, 0.3 - forward],
            ]
          : [
              [0.5 - side, 0.3 + forward],
              [0.5 + side, 0.3 + forward],
            ]

  const look = size * 0.045
  const lookOffset: [number, number] =
    dir === 'RIGHT'
      ? [look, 0]
      : dir === 'LEFT'
        ? [-look, 0]
        : dir === 'UP'
          ? [0, -look]
          : [0, look]

  ctx.fillStyle = headFlash ? 'rgba(255, 241, 242, 0.95)' : 'rgba(236, 253, 245, 0.95)'
  for (const [ox, oy] of offsets) {
    ctx.beginPath()
    ctx.arc(x + ox * size, y + oy * size, eyeRadius, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'rgba(2, 6, 23, 0.9)'
  for (const [ox, oy] of offsets) {
    ctx.beginPath()
    ctx.arc(
      x + ox * size + lookOffset[0],
      y + oy * size + lookOffset[1],
      pupilRadius,
      0,
      Math.PI * 2,
    )
    ctx.fill()
  }
}

/** Soft radial tint in the skin's accent colour, anchored near the top. */
function drawAmbientGlow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: SkinPalette,
) {
  const cx = width / 2
  const cy = height * 0.32
  const radius = Math.max(width, height) * 0.75
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  gradient.addColorStop(0, withAlpha(palette.head, 0.09))
  gradient.addColorStop(0.6, withAlpha(palette.body, 0.03))
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

/** Darkens the corners so the board edges recede and the snake reads clearly. */
function drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.35,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75,
  )
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, 'rgba(2, 6, 23, 0.55)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

function drawFood(
  ctx: CanvasRenderingContext2D,
  food: Position,
  cell: number,
  now: number,
  color: string,
) {
  const pulse = 1 + Math.sin(now / 300) * 0.08
  const size = cell * 0.62 * pulse
  const x = food.x * cell + (cell - size) / 2
  const y = food.y * cell + (cell - size) / 2

  ctx.shadowColor = withAlpha(color, 0.9)
  ctx.shadowBlur = 16
  // Drop shadow underneath makes the food sit above the grid.
  ctx.fillStyle = 'rgba(2, 6, 23, 0.45)'
  roundRect(ctx, x + size * 0.08, y + size * 0.12, size, size, size * 0.3)
  ctx.fill()

  ctx.fillStyle = color
  roundRect(ctx, x, y, size, size, size * 0.3)
  ctx.fill()
  ctx.shadowBlur = 0

  // Glossy highlight: a bright upper-left spot over a softer sheen.
  ctx.save()
  roundRect(ctx, x, y, size, size, size * 0.3)
  ctx.clip()
  const sheen = ctx.createLinearGradient(x, y, x, y + size)
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
  sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)')
  sheen.addColorStop(1, 'rgba(0, 0, 0, 0.12)')
  ctx.fillStyle = sheen
  ctx.fillRect(x, y, size, size)
  ctx.restore()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
  ctx.beginPath()
  ctx.arc(x + size * 0.32, y + size * 0.28, size * 0.13, 0, Math.PI * 2)
  ctx.fill()
}

function drawBonusFood(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  cell: number,
  now: number,
  expireAt: number,
) {
  const lifetime = BONUS_FOOD_LIFETIME_MS
  const frac = Math.max(0, Math.min(1, (expireAt - now) / lifetime))
  const cx = (pos.x + 0.5) * cell
  const cy = (pos.y + 0.5) * cell
  const pulse = 1 + Math.sin(now / 180) * 0.15

  const halo = cell * (0.5 + 0.3 * frac) * pulse
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, halo)
  gradient.addColorStop(0, `rgba(251, 191, 36, ${0.5 * frac})`)
  gradient.addColorStop(1, 'rgba(251, 191, 36, 0)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(cx, cy, halo, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = 0.3 + 0.7 * frac
  ctx.shadowColor = 'rgba(251, 191, 36, 0.95)'
  ctx.shadowBlur = 16
  const size = cell * 0.5 * pulse
  drawStar(ctx, cx, cy, size, '#fbbf24')
  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
}

function drawShieldRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cell: number,
  now: number,
) {
  const pulse = 1 + Math.sin(now / 260) * 0.08
  ctx.beginPath()
  ctx.arc(cx, cy, cell * 0.7 * pulse, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)'
  ctx.lineWidth = Math.max(2, cell * 0.09)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, cell * 0.92 * pulse, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)'
  ctx.lineWidth = Math.max(1, cell * 0.04)
  ctx.stroke()
}

function drawPowerUp(ctx: CanvasRenderingContext2D, powerUp: PowerUp, cell: number, now: number) {
  const cx = (powerUp.pos.x + 0.5) * cell
  const cy = (powerUp.pos.y + 0.5) * cell

  const { color, glow } = kindStyle(powerUp.kind)
  const pulse = 1 + Math.sin(now / 220) * 0.12
  const halo = cell * 0.85 * pulse
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, halo)
  gradient.addColorStop(0, glow)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(cx, cy, halo, 0, Math.PI * 2)
  ctx.fill()

  const size = cell * 0.5
  ctx.shadowColor = glow
  ctx.shadowBlur = 14
  drawPowerUpShape(ctx, powerUp.kind, cx, cy, size, color)
  ctx.shadowBlur = 0

  ctx.fillStyle = 'rgba(250, 245, 255, 0.95)'
  ctx.font = `bold ${Math.round(cell * 0.26)}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(kindLabel(powerUp.kind), cx, cy + size * 1.5)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

/**
 * Each power-up gets its own silhouette so players can identify it at a glance
 * without relying on the colour alone.
 */
function drawPowerUpShape(
  ctx: CanvasRenderingContext2D,
  kind: PowerUpKind,
  cx: number,
  cy: number,
  size: number,
  color: string,
) {
  ctx.fillStyle = color
  switch (kind) {
    case 'shield': {
      // Classic heater-shield outline with a notched base.
      const w = size * 0.92
      const h = size * 1.08
      const top = cy - h / 2
      ctx.beginPath()
      ctx.moveTo(cx, top)
      ctx.lineTo(cx + w / 2, top + h * 0.22)
      ctx.lineTo(cx + w / 2, top + h * 0.62)
      ctx.quadraticCurveTo(cx + w / 2, top + h * 0.88, cx, top + h)
      ctx.quadraticCurveTo(cx - w / 2, top + h * 0.88, cx - w / 2, top + h * 0.62)
      ctx.lineTo(cx - w / 2, top + h * 0.22)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'double': {
      // Two stacked arrows pointing right.
      const arrow = (offsetY: number) => {
        ctx.beginPath()
        ctx.moveTo(cx - size * 0.42, cy + offsetY - size * 0.16)
        ctx.lineTo(cx + size * 0.08, cy + offsetY - size * 0.16)
        ctx.lineTo(cx + size * 0.08, cy + offsetY - size * 0.32)
        ctx.lineTo(cx + size * 0.46, cy + offsetY)
        ctx.lineTo(cx + size * 0.08, cy + offsetY + size * 0.32)
        ctx.lineTo(cx + size * 0.08, cy + offsetY + size * 0.16)
        ctx.lineTo(cx - size * 0.42, cy + offsetY + size * 0.16)
        ctx.closePath()
        ctx.fill()
      }
      arrow(-size * 0.24)
      arrow(size * 0.24)
      break
    }
    default: {
      // Hourglass for slow.
      const w = size * 0.78
      const h = size * 1.02
      const top = cy - h / 2
      const midY = cy
      ctx.beginPath()
      ctx.moveTo(cx - w / 2, top)
      ctx.lineTo(cx + w / 2, top)
      ctx.lineTo(cx + w * 0.16, midY)
      ctx.lineTo(cx + w / 2, top + h)
      ctx.lineTo(cx - w / 2, top + h)
      ctx.lineTo(cx - w * 0.16, midY)
      ctx.closePath()
      ctx.fill()
      // Cap bars top and bottom.
      roundRect(ctx, cx - w * 0.62, top - size * 0.1, w * 1.24, size * 0.16, size * 0.08)
      ctx.fill()
      roundRect(ctx, cx - w * 0.62, top + h - size * 0.06, w * 1.24, size * 0.16, size * 0.08)
      ctx.fill()
      break
    }
  }
}

function kindStyle(kind: PowerUpKind): { color: string; glow: string; label: string } {
  if (kind === 'shield') return { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.55)', label: '🛡️' }
  if (kind === 'double') return { color: '#e879f9', glow: 'rgba(232, 121, 249, 0.55)', label: '×2' }
  return { color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.55)', label: 'SLOW' }
}

function kindLabel(kind: PowerUpKind): string {
  return kindStyle(kind).label
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  color = '#a78bfa',
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
  ctx.fillStyle = color
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
  const font = `bold ${Math.round(cell * 0.82)}px Inter, sans-serif`
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  for (const f of floats) {
    const ratio = f.age / f.duration
    const x = f.x * cell
    const y = f.y * cell - ratio * cell * 1.2
    ctx.globalAlpha = Math.max(0, 1 - ratio)
    // Dark stroke first so the number stays legible over food or the snake.
    ctx.strokeStyle = 'rgba(2, 6, 23, 0.85)'
    ctx.lineWidth = Math.max(3, cell * 0.12)
    ctx.strokeText(f.text, x, y)
    ctx.fillStyle = f.color ?? '#6ee7b7'
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