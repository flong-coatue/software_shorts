import { clamp, lerp } from './mathUtils'
import { COLORS, MOMENTUM_THRESHOLD } from '../styles/theme'

interface RGB {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result || !result[1] || !result[2] || !result[3]) {
    return { r: 0, g: 0, b: 0 }
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

function rgbToHex(rgb: RGB): string {
  return '#' + [rgb.r, rgb.g, rgb.b]
    .map(x => Math.round(x).toString(16).padStart(2, '0'))
    .join('')
}

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return {
    r: lerp(a.r, b.r, t),
    g: lerp(a.g, b.g, t),
    b: lerp(a.b, b.b, t),
  }
}

const coolRgb = hexToRgb(COLORS.cool)
const neutralRgb = hexToRgb(COLORS.neutral)
const hotRgb = hexToRgb(COLORS.hot)

/**
 * Maps momentum (-threshold to +threshold) to color gradient
 * Negative momentum → cyan (cool)
 * Zero momentum → purple (neutral)
 * Positive momentum → magenta (hot)
 */
export function getMomentumColor(momentum: number): string {
  const normalizedMomentum = clamp(momentum / MOMENTUM_THRESHOLD, -1, 1)

  if (normalizedMomentum < 0) {
    // Cool to neutral
    const t = normalizedMomentum + 1 // 0 to 1
    return rgbToHex(lerpRgb(coolRgb, neutralRgb, t))
  } else {
    // Neutral to hot
    const t = normalizedMomentum // 0 to 1
    return rgbToHex(lerpRgb(neutralRgb, hotRgb, t))
  }
}

/**
 * Returns rgba string with specified alpha
 */
export function colorWithAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

/**
 * Creates a glow color (lighter version with transparency)
 */
export function getGlowColor(hex: string, intensity: number = 0.5): string {
  const rgb = hexToRgb(hex)
  const boosted = {
    r: Math.min(255, rgb.r + (255 - rgb.r) * 0.3),
    g: Math.min(255, rgb.g + (255 - rgb.g) * 0.3),
    b: Math.min(255, rgb.b + (255 - rgb.b) * 0.3),
  }
  return `rgba(${Math.round(boosted.r)}, ${Math.round(boosted.g)}, ${Math.round(boosted.b)}, ${intensity})`
}
