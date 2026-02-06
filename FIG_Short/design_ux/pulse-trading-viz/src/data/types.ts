export interface PricePoint {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MappedPricePoint extends PricePoint {
  x: number
  y: number
  momentum: number
  normalizedVolume: number
}
