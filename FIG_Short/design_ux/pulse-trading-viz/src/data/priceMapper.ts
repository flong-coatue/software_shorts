import { PricePoint, MappedPricePoint } from './types'

interface ChartDimensions {
  width: number
  height: number
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

/**
 * Maps price data to canvas coordinates with momentum and volume normalization
 */
export function mapPriceData(
  data: PricePoint[],
  dimensions: ChartDimensions
): MappedPricePoint[] {
  if (data.length === 0) return []

  const { width, height, padding } = dimensions
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Find price range
  let minPrice = Infinity
  let maxPrice = -Infinity
  let maxVolume = 0

  for (const point of data) {
    minPrice = Math.min(minPrice, point.low)
    maxPrice = Math.max(maxPrice, point.high)
    maxVolume = Math.max(maxVolume, point.volume)
  }

  // Add 5% padding to price range
  const priceRange = maxPrice - minPrice
  minPrice -= priceRange * 0.05
  maxPrice += priceRange * 0.05

  // Map each point
  return data.map((point, index) => {
    // X position: linear across chart width
    const x = padding.left + (index / (data.length - 1)) * chartWidth

    // Y position: inverted (higher price = lower Y)
    const priceNormalized = (point.close - minPrice) / (maxPrice - minPrice)
    const y = padding.top + (1 - priceNormalized) * chartHeight

    // Momentum: percentage change from previous close
    const prevPoint = data[index - 1]
    const momentum = prevPoint
      ? (point.close - prevPoint.close) / prevPoint.close
      : 0

    // Volume normalized 0-1
    const normalizedVolume = point.volume / maxVolume

    return {
      ...point,
      x,
      y,
      momentum,
      normalizedVolume,
    }
  })
}

/**
 * Finds the closest price point to a given x coordinate
 */
export function findNearestPoint(
  mappedData: MappedPricePoint[],
  targetX: number
): MappedPricePoint | null {
  if (mappedData.length === 0) return null

  let closest = mappedData[0]
  let closestDist = Infinity

  for (const point of mappedData) {
    if (!point) continue
    const dist = Math.abs(point.x - targetX)
    if (dist < closestDist) {
      closestDist = dist
      closest = point
    }
  }

  return closest ?? null
}

/**
 * Interpolates Y position for a given X between price points
 */
export function interpolateY(
  mappedData: MappedPricePoint[],
  targetX: number
): number | null {
  if (mappedData.length < 2) return null

  // Find surrounding points
  for (let i = 0; i < mappedData.length - 1; i++) {
    const current = mappedData[i]
    const next = mappedData[i + 1]
    if (!current || !next) continue

    if (targetX >= current.x && targetX <= next.x) {
      const t = (targetX - current.x) / (next.x - current.x)
      return current.y + (next.y - current.y) * t
    }
  }

  return null
}
