export interface Particle {
  // Position
  x: number
  y: number

  // Velocity
  vx: number
  vy: number

  // Target (point on price line this particle orbits)
  targetX: number
  targetY: number

  // Visual properties
  radius: number
  alpha: number
  color: string

  // Lifecycle
  life: number
  maxLife: number
  active: boolean

  // Which price point this particle belongs to
  priceIndex: number
}

export function createParticle(): Particle {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    targetX: 0,
    targetY: 0,
    radius: 2,
    alpha: 1,
    color: '#8888FF',
    life: 0,
    maxLife: 1000,
    active: false,
    priceIndex: 0,
  }
}

export function resetParticle(
  particle: Particle,
  targetX: number,
  targetY: number,
  color: string,
  priceIndex: number,
  spread: number = 15
): void {
  // Start near target with tighter spread
  const angle = Math.random() * Math.PI * 2
  const distance = Math.random() * spread

  particle.x = targetX + Math.cos(angle) * distance
  particle.y = targetY + Math.sin(angle) * distance

  // Gentle initial velocity
  const perpAngle = angle + Math.PI / 2
  const speed = 0.2 + Math.random() * 0.4
  particle.vx = Math.cos(perpAngle) * speed
  particle.vy = Math.sin(perpAngle) * speed

  particle.targetX = targetX
  particle.targetY = targetY

  particle.radius = 1 + Math.random() * 1
  particle.alpha = 0.4 + Math.random() * 0.5
  particle.color = color

  particle.life = 0
  particle.maxLife = 600 + Math.random() * 400
  particle.active = true
  particle.priceIndex = priceIndex
}
