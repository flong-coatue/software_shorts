import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Canvas } from './Canvas'
import { ControlPanel } from './ControlPanel'
import { PriceTooltip } from './PriceTooltip'
import { useCanvas } from '../hooks/useCanvas'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { useMouseInteraction } from '../hooks/useMouseInteraction'
import { ParticleEngine } from '../engine/ParticleEngine'
import {
  clearCanvas,
  drawGrid,
  drawParticles,
  drawVolumeFog,
  drawHotspot,
  drawPricePath,
  RenderContext,
} from '../engine/Renderer'
import { generateMockData, generateNextPoint } from '../data/mockGenerator'
import { mapPriceData } from '../data/priceMapper'
import { PricePoint, MappedPricePoint } from '../data/types'
import { getMomentumColor } from '../utils/colorUtils'
import { PARTICLE_CONFIG } from '../styles/theme'

const PADDING = {
  top: 80,
  right: 60,
  bottom: 100,
  left: 80,
}

export function PulseChart() {
  const { canvasRef, ctx, size } = useCanvas()
  const [isPlaying, setIsPlaying] = useState(true)
  const [particleMultiplier, setParticleMultiplier] = useState(1)

  // Price data state
  const [priceData, setPriceData] = useState<PricePoint[]>(() => generateMockData(150))

  // Mapped price data (recalculated when size or data changes)
  const mappedData = useMemo<MappedPricePoint[]>(() => {
    if (size.width === 0 || size.height === 0) return []
    return mapPriceData(priceData, {
      width: size.width,
      height: size.height,
      padding: PADDING,
    })
  }, [priceData, size])

  // Mouse interaction
  const { mouseState, nearestPoint } = useMouseInteraction(canvasRef, mappedData)

  // Particle engine
  const engineRef = useRef<ParticleEngine | null>(null)
  const pulsePhaseRef = useRef(0)
  const lastDataUpdateRef = useRef(0)

  // Initialize engine
  useEffect(() => {
    engineRef.current = new ParticleEngine({ particleMultiplier })
    return () => {
      engineRef.current?.clear()
    }
  }, [])

  // Update engine with price data
  useEffect(() => {
    engineRef.current?.setPriceData(mappedData)
  }, [mappedData])

  // Update particle multiplier
  useEffect(() => {
    engineRef.current?.setParticleMultiplier(particleMultiplier)
  }, [particleMultiplier])

  // Animation frame callback
  const animate = useCallback((deltaTime: number, currentTime: number) => {
    if (!ctx || !engineRef.current || size.width === 0) return

    const engine = engineRef.current

    // Update gravity well from mouse
    engine.setGravityWell(mouseState.x, mouseState.y, mouseState.isOver)

    // Update physics
    engine.update(deltaTime, currentTime)

    // Update pulse phase (slower)
    pulsePhaseRef.current += deltaTime * PARTICLE_CONFIG.hotspotPulseSpeed * 0.5

    // Simulate live data updates (every 2 seconds)
    if (currentTime - lastDataUpdateRef.current > 2000) {
      const lastPoint = priceData[priceData.length - 1]
      if (lastPoint) {
        const newPoint = generateNextPoint(lastPoint)
        setPriceData(prev => [...prev.slice(-149), newPoint])
        lastDataUpdateRef.current = currentTime
      }
    }

    // Render
    const render: RenderContext = { ctx, width: size.width, height: size.height, dpr: size.dpr }

    clearCanvas(render)
    drawGrid(render, PADDING)
    drawVolumeFog(render, mappedData, PADDING)
    drawPricePath(ctx, mappedData)
    drawParticles(ctx, engine.getParticles())

    // Draw hotspot at current price
    if (mappedData.length > 0) {
      const lastMapped = mappedData[mappedData.length - 1]!
      const color = getMomentumColor(lastMapped.momentum)
      drawHotspot(ctx, lastMapped.x, lastMapped.y, color, pulsePhaseRef.current)
    }
  }, [ctx, size, mouseState, mappedData, priceData])

  useAnimationFrame(animate, isPlaying)

  // Current price display
  const currentPrice = priceData[priceData.length - 1]?.close ?? 0
  const prevPrice = priceData[priceData.length - 2]?.close ?? currentPrice
  const priceChange = currentPrice - prevPrice
  const priceChangePercent = prevPrice > 0 ? (priceChange / prevPrice) * 100 : 0
  const isUp = priceChange >= 0

  return (
    <div className="pulse-chart">
      <Canvas ref={canvasRef} />

      {/* CRT and vignette overlays */}
      <div className="crt-overlay" />
      <div className="vignette" />

      {/* Header */}
      <div className="chart-header">
        <div className="chart-ticker">PULSE</div>
        <div className="chart-subtitle">Particle Stock Visualization</div>
        <div className="chart-price-display">
          <div className="current-price" style={{ color: isUp ? '#DD66DD' : '#4DD4D4' }}>
            ${currentPrice.toFixed(2)}
          </div>
          <div className={`price-change ${isUp ? 'up' : 'down'}`}>
            {isUp ? '+' : ''}{priceChange.toFixed(2)} ({isUp ? '+' : ''}{priceChangePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-dot cool" />
          <span>Downtrend</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot neutral" />
          <span>Neutral</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot hot" />
          <span>Uptrend</span>
        </div>
      </div>

      {/* Tooltip */}
      {mouseState.isOver && nearestPoint && (
        <PriceTooltip
          point={nearestPoint}
          x={mouseState.x}
          y={mouseState.y}
        />
      )}

      {/* Controls */}
      <ControlPanel
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        particleMultiplier={particleMultiplier}
        onParticleMultiplierChange={setParticleMultiplier}
        particleCount={engineRef.current?.getActiveCount() ?? 0}
      />
    </div>
  )
}
