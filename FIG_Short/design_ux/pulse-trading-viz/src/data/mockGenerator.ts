import { PricePoint } from './types'
import { randomGaussian, randomRange } from '../utils/mathUtils'

/**
 * Generates realistic-looking stock price data using random walk with drift
 */
export function generateMockData(
  numPoints: number = 200,
  startPrice: number = 150,
  volatility: number = 0.02,
  drift: number = 0.0001
): PricePoint[] {
  const data: PricePoint[] = []
  let price = startPrice
  const now = Date.now()
  const interval = 5 * 60 * 1000 // 5 minute candles

  // Base volume with some variance
  const baseVolume = 1000000

  for (let i = 0; i < numPoints; i++) {
    // Random walk with drift
    const change = randomGaussian() * volatility + drift
    const newPrice = price * (1 + change)

    // Generate OHLC from close price with realistic intra-candle movement
    const candleVolatility = Math.abs(change) + randomRange(0.001, 0.01)
    const high = newPrice * (1 + candleVolatility * randomRange(0.2, 1))
    const low = newPrice * (1 - candleVolatility * randomRange(0.2, 1))
    const open = price

    // Volume spikes during price movement
    const volumeMultiplier = 1 + Math.abs(change) * 20 + randomRange(-0.3, 0.5)
    const volume = Math.max(100000, baseVolume * volumeMultiplier)

    data.push({
      timestamp: now - (numPoints - i) * interval,
      open,
      high: Math.max(open, newPrice, high),
      low: Math.min(open, newPrice, low),
      close: newPrice,
      volume,
    })

    price = newPrice
  }

  return data
}

/**
 * Adds a new price point to existing data (for live simulation)
 */
export function generateNextPoint(lastPoint: PricePoint, volatility: number = 0.015): PricePoint {
  const change = randomGaussian() * volatility
  const newPrice = lastPoint.close * (1 + change)
  const interval = 5 * 60 * 1000

  const candleVolatility = Math.abs(change) + randomRange(0.001, 0.008)
  const high = newPrice * (1 + candleVolatility * randomRange(0.2, 1))
  const low = newPrice * (1 - candleVolatility * randomRange(0.2, 1))

  const volumeMultiplier = 1 + Math.abs(change) * 15 + randomRange(-0.2, 0.4)
  const volume = Math.max(100000, 1000000 * volumeMultiplier)

  return {
    timestamp: lastPoint.timestamp + interval,
    open: lastPoint.close,
    high: Math.max(lastPoint.close, newPrice, high),
    low: Math.min(lastPoint.close, newPrice, low),
    close: newPrice,
    volume,
  }
}
