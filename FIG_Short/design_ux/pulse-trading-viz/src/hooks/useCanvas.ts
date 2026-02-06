import { useRef, useEffect, useState, useCallback } from 'react'

interface CanvasSize {
  width: number
  height: number
  dpr: number
}

/**
 * Hook for managing canvas with high-DPI support and resize handling
 */
export function useCanvas(): {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  ctx: CanvasRenderingContext2D | null
  size: CanvasSize
} {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0, dpr: 1 })

  const updateSize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const dpr = window.devicePixelRatio || 1
    const rect = parent.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    // Set canvas size accounting for DPI
    canvas.width = width * dpr
    canvas.height = height * dpr

    // Set display size
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // Scale context for DPI
    const context = canvas.getContext('2d')
    if (context) {
      context.scale(dpr, dpr)
      setCtx(context)
    }

    setSize({ width, height, dpr })
  }, [])

  useEffect(() => {
    updateSize()

    const resizeObserver = new ResizeObserver(() => {
      updateSize()
    })

    const parent = canvasRef.current?.parentElement
    if (parent) {
      resizeObserver.observe(parent)
    }

    window.addEventListener('resize', updateSize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [updateSize])

  return { canvasRef, ctx, size }
}
