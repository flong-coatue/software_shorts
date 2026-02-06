import { useEffect, useRef } from 'react'

type FrameCallback = (deltaTime: number, currentTime: number) => void

/**
 * Hook for running animation loop with delta time
 */
export function useAnimationFrame(
  callback: FrameCallback,
  isRunning: boolean = true
): void {
  const frameRef = useRef<number>(0)
  const previousTimeRef = useRef<number>(0)
  const callbackRef = useRef<FrameCallback>(callback)

  // Update callback ref without causing re-subscription
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!isRunning) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = 0
      }
      return
    }

    const animate = (currentTime: number) => {
      if (previousTimeRef.current === 0) {
        previousTimeRef.current = currentTime
      }

      const deltaTime = Math.min(currentTime - previousTimeRef.current, 50) // Cap at 50ms
      previousTimeRef.current = currentTime

      callbackRef.current(deltaTime, currentTime)

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [isRunning])
}
