import { Particle } from './Particle'
import { distance, subtract, normalize, multiply, randomRange } from '../utils/mathUtils'
import { PARTICLE_CONFIG } from '../styles/theme'

const {
  friction,
  attractionStrength,
  noiseAmount,
  gravityWellRadius,
  gravityWellStrength,
} = PARTICLE_CONFIG

export interface GravityWell {
  x: number
  y: number
  active: boolean
}

/**
 * Update particle physics for one frame
 */
export function updateParticle(
  particle: Particle,
  deltaTime: number,
  gravityWell: GravityWell | null
): void {
  if (!particle.active) return

  const dt = deltaTime / 16.67 // Normalize to ~60fps

  // 1. Attraction to target position (price line)
  const toTarget = subtract(
    { x: particle.targetX, y: particle.targetY },
    { x: particle.x, y: particle.y }
  )
  const targetDist = distance(
    { x: particle.x, y: particle.y },
    { x: particle.targetX, y: particle.targetY }
  )

  if (targetDist > 0.1) {
    const attractionForce = multiply(
      normalize(toTarget),
      attractionStrength * Math.min(targetDist, 50) * dt
    )
    particle.vx += attractionForce.x
    particle.vy += attractionForce.y
  }

  // 2. Gravity well (mouse interaction)
  if (gravityWell?.active) {
    const toWell = subtract(
      { x: gravityWell.x, y: gravityWell.y },
      { x: particle.x, y: particle.y }
    )
    const wellDist = distance(
      { x: particle.x, y: particle.y },
      { x: gravityWell.x, y: gravityWell.y }
    )

    if (wellDist < gravityWellRadius && wellDist > 1) {
      const falloff = 1 - wellDist / gravityWellRadius
      const wellForce = multiply(
        normalize(toWell),
        gravityWellStrength * falloff * falloff * dt
      )
      particle.vx += wellForce.x
      particle.vy += wellForce.y
    }
  }

  // 3. Random noise for organic movement
  particle.vx += randomRange(-noiseAmount, noiseAmount) * dt
  particle.vy += randomRange(-noiseAmount, noiseAmount) * dt

  // 4. Apply friction
  particle.vx *= Math.pow(friction, dt)
  particle.vy *= Math.pow(friction, dt)

  // 5. Update position
  particle.x += particle.vx * dt
  particle.y += particle.vy * dt

  // 6. Update lifecycle
  particle.life += deltaTime

  // Fade out as life approaches max
  const lifeRatio = particle.life / particle.maxLife
  if (lifeRatio > 0.7) {
    particle.alpha = Math.max(0, 1 - (lifeRatio - 0.7) / 0.3)
  }
}

/**
 * Check if particle should be recycled
 */
export function shouldRecycle(particle: Particle): boolean {
  return particle.life >= particle.maxLife || particle.alpha <= 0
}

/**
 * Apply orbital motion tendency (particles circle around their target)
 */
export function applyOrbitalTendency(particle: Particle, strength: number = 0.02): void {
  // Get vector perpendicular to target
  const toTarget = subtract(
    { x: particle.targetX, y: particle.targetY },
    { x: particle.x, y: particle.y }
  )
  const dist = distance(
    { x: particle.x, y: particle.y },
    { x: particle.targetX, y: particle.targetY }
  )

  if (dist > 5 && dist < 100) {
    // Perpendicular direction (clockwise orbit)
    const perpX = -toTarget.y / dist
    const perpY = toTarget.x / dist

    particle.vx += perpX * strength
    particle.vy += perpY * strength
  }
}
