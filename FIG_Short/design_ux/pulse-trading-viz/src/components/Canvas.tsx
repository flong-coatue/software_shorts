import { forwardRef } from 'react'

interface CanvasProps {
  className?: string
}

/**
 * Canvas element with high-DPI support
 * Size is managed by useCanvas hook in parent
 */
export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  function Canvas({ className = '' }, ref) {
    return (
      <canvas
        ref={ref}
        className={`chart-canvas ${className}`}
      />
    )
  }
)
