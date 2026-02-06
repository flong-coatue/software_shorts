import { Particle } from './Particle'
import { MappedPricePoint } from '../data/types'
import { COLORS, PARTICLE_CONFIG } from '../styles/theme'
import { colorWithAlpha } from '../utils/colorUtils'

export interface RenderContext {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  dpr: number
}

/**
 * Clear canvas with background
 */
export function clearCanvas(render: RenderContext): void {
  const { ctx, width, height } = render
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, width, height)
}

/**
 * Draw subtle grid background
 */
export function drawGrid(render: RenderContext, padding: { left: number; right: number; top: number; bottom: number }): void {
  const { ctx, width, height } = render

  const gridSpacing = 60
  const chartLeft = padding.left
  const chartRight = width - padding.right
  const chartTop = padding.top
  const chartBottom = height - padding.bottom

  ctx.strokeStyle = COLORS.grid
  ctx.lineWidth = 1

  // Vertical lines
  ctx.beginPath()
  for (let x = chartLeft; x <= chartRight; x += gridSpacing) {
    ctx.moveTo(x, chartTop)
    ctx.lineTo(x, chartBottom)
  }
  ctx.stroke()

  // Horizontal lines
  ctx.beginPath()
  for (let y = chartTop; y <= chartBottom; y += gridSpacing) {
    ctx.moveTo(chartLeft, y)
    ctx.lineTo(chartRight, y)
  }
  ctx.stroke()
}

/**
 * Draw single particle with subtle glow
 */
export function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
  if (!particle.active || particle.alpha <= 0) return

  const { x, y, radius, color, alpha } = particle

  // Subtle outer glow
  const glowSize = radius * 2
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
  gradient.addColorStop(0, colorWithAlpha(color, alpha * 0.5))
  gradient.addColorStop(1, colorWithAlpha(color, 0))

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, glowSize, 0, Math.PI * 2)
  ctx.fill()

  // Core
  ctx.fillStyle = colorWithAlpha(color, alpha * 0.8)
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * Draw all particles efficiently
 */
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  // Sort by alpha for better blending (lower alpha drawn first)
  const sorted = particles.filter(p => p.active).sort((a, b) => a.alpha - b.alpha)

  for (const particle of sorted) {
    drawParticle(ctx, particle)
  }
}

/**
 * Draw volume fog beneath price line
 */
export function drawVolumeFog(
  render: RenderContext,
  priceData: MappedPricePoint[],
  padding: { bottom: number }
): void {
  const { ctx, height } = render
  if (priceData.length < 2) return

  const chartBottom = height - padding.bottom

  ctx.beginPath()
  ctx.moveTo(priceData[0]!.x, chartBottom)

  // Draw path along price line
  for (const point of priceData) {
    ctx.lineTo(point.x, point.y)
  }

  // Close back to bottom
  ctx.lineTo(priceData[priceData.length - 1]!.x, chartBottom)
  ctx.closePath()

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, priceData[0]!.y, 0, chartBottom)
  gradient.addColorStop(0, 'rgba(100, 100, 200, 0.08)')
  gradient.addColorStop(0.5, 'rgba(100, 100, 200, 0.03)')
  gradient.addColorStop(1, 'rgba(100, 100, 200, 0)')

  ctx.fillStyle = gradient
  ctx.fill()
}

/**
 * Draw current price hotspot with gentle pulsing
 */
export function drawHotspot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  pulsePhase: number
): void {
  const { hotspotSize } = PARTICLE_CONFIG

  // Gentle pulse
  const pulse = 0.85 + Math.sin(pulsePhase) * 0.15
  const size = hotspotSize * pulse

  // Single soft glow layer
  const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5)
  glowGradient.addColorStop(0, colorWithAlpha(color, 0.15))
  glowGradient.addColorStop(1, colorWithAlpha(color, 0))

  ctx.fillStyle = glowGradient
  ctx.beginPath()
  ctx.arc(x, y, size * 2.5, 0, Math.PI * 2)
  ctx.fill()

  // Core
  const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, size)
  coreGradient.addColorStop(0, colorWithAlpha(COLORS.hotspotCore, 0.9))
  coreGradient.addColorStop(0.5, colorWithAlpha(color, 0.6))
  coreGradient.addColorStop(1, colorWithAlpha(color, 0))

  ctx.fillStyle = coreGradient
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * Draw subtle price line path
 */
export function drawPricePath(
  ctx: CanvasRenderingContext2D,
  priceData: MappedPricePoint[]
): void {
  if (priceData.length < 2) return

  ctx.beginPath()
  ctx.moveTo(priceData[0]!.x, priceData[0]!.y)

  for (let i = 1; i < priceData.length; i++) {
    const point = priceData[i]!
    ctx.lineTo(point.x, point.y)
  }

  ctx.strokeStyle = 'rgba(136, 136, 255, 0.15)'
  ctx.lineWidth = 1.5
  ctx.stroke()
}
