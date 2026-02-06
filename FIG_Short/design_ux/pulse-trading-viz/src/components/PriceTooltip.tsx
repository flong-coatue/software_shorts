import { MappedPricePoint } from '../data/types'

interface PriceTooltipProps {
  point: MappedPricePoint
  x: number
  y: number
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toString()
}

export function PriceTooltip({ point, x, y }: PriceTooltipProps) {
  const priceClass = point.momentum > 0.001 ? 'up' : point.momentum < -0.001 ? 'down' : 'neutral'

  // Position tooltip to avoid edges
  const offsetX = x > window.innerWidth - 200 ? -180 : 20
  const offsetY = y > window.innerHeight - 150 ? -100 : 20

  return (
    <div
      className="price-tooltip"
      style={{
        left: x + offsetX,
        top: y + offsetY,
      }}
    >
      <div className={`tooltip-price ${priceClass}`}>
        {formatPrice(point.close)}
      </div>
      <div className="tooltip-date">
        {formatDate(point.timestamp)}
      </div>
      <div className="tooltip-volume">
        Volume: {formatVolume(point.volume)}
      </div>
    </div>
  )
}
