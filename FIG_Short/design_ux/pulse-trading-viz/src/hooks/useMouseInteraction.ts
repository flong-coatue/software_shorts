import { useEffect, useState } from 'react'
import { MappedPricePoint } from '../data/types'
import { findNearestPoint } from '../data/priceMapper'

interface MouseState {
  x: number
  y: number
  isOver: boolean
}

interface UseMouseInteractionResult {
  mouseState: MouseState
  nearestPoint: MappedPricePoint | null
}

/**
 * Hook for tracking mouse position and finding nearest price point
 */
export function useMouseInteraction(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  priceData: MappedPricePoint[]
): UseMouseInteractionResult {
  const [mouseState, setMouseState] = useState<MouseState>({
    x: 0,
    y: 0,
    isOver: false,
  })
  const [nearestPoint, setNearestPoint] = useState<MappedPricePoint | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setMouseState({ x, y, isOver: true })

      // Find nearest price point
      const nearest = findNearestPoint(priceData, x)
      setNearestPoint(nearest)
    }

    const handleMouseLeave = () => {
      setMouseState(prev => ({ ...prev, isOver: false }))
      setNearestPoint(null)
    }

    const handleMouseEnter = () => {
      setMouseState(prev => ({ ...prev, isOver: true }))
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    canvas.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [canvasRef, priceData])

  return { mouseState, nearestPoint }
}
