import { Particle, resetParticle } from './Particle'
import { ParticlePool } from './ParticlePool'
import { updateParticle, shouldRecycle, applyOrbitalTendency, GravityWell } from './Physics'
import { MappedPricePoint } from '../data/types'
import { getMomentumColor } from '../utils/colorUtils'
import { PARTICLE_CONFIG } from '../styles/theme'

export interface EngineConfig {
  particleMultiplier: number // 0.5 to 2.0
}

export class ParticleEngine {
  private pool: ParticlePool
  private config: EngineConfig
  private priceData: MappedPricePoint[] = []
  private gravityWell: GravityWell = { x: 0, y: 0, active: false }
  private lastSpawnTime = 0
  private spawnInterval = 16 // ms between spawn batches

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = {
      particleMultiplier: 1,
      ...config,
    }
    this.pool = new ParticlePool(2000)
  }

  /**
   * Set price data for particle distribution
   */
  setPriceData(data: MappedPricePoint[]): void {
    this.priceData = data
  }

  /**
   * Update gravity well position (mouse)
   */
  setGravityWell(x: number, y: number, active: boolean): void {
    this.gravityWell = { x, y, active }
  }

  /**
   * Update particle count multiplier
   */
  setParticleMultiplier(multiplier: number): void {
    this.config.particleMultiplier = multiplier
  }

  /**
   * Main update loop - call once per frame
   */
  update(deltaTime: number, currentTime: number): void {
    const particles = this.pool.getAll()

    // Update existing particles
    for (const particle of particles) {
      if (!particle.active) continue

      // Apply physics
      updateParticle(particle, deltaTime, this.gravityWell)
      applyOrbitalTendency(particle, 0.005)

      // Recycle dead particles
      if (shouldRecycle(particle)) {
        this.pool.release(particle)
      }
    }

    // Spawn new particles
    if (currentTime - this.lastSpawnTime > this.spawnInterval) {
      this.spawnParticles()
      this.lastSpawnTime = currentTime
    }
  }

  /**
   * Spawn particles distributed across price points
   */
  private spawnParticles(): void {
    if (this.priceData.length === 0) return

    const { baseCount } = PARTICLE_CONFIG
    const targetCount = Math.floor(baseCount * this.config.particleMultiplier)
    const currentCount = this.pool.getActiveCount()

    // Spawn rate based on how far below target we are
    const deficit = targetCount - currentCount
    const spawnCount = Math.min(Math.max(deficit * 0.1, 1), 20)

    for (let i = 0; i < spawnCount; i++) {
      this.spawnSingleParticle()
    }
  }

  /**
   * Spawn particle at a price point weighted by volume
   */
  private spawnSingleParticle(): void {
    if (this.priceData.length === 0) return

    // Weight selection by volume (higher volume = more particles)
    const totalWeight = this.priceData.reduce((sum, p) => sum + (0.3 + p.normalizedVolume * 0.7), 0)
    let random = Math.random() * totalWeight
    let selectedIndex = 0

    for (let i = 0; i < this.priceData.length; i++) {
      const point = this.priceData[i]!
      const weight = 0.3 + point.normalizedVolume * 0.7
      random -= weight

      if (random <= 0) {
        selectedIndex = i
        break
      }
    }

    const point = this.priceData[selectedIndex]!
    const particle = this.pool.acquire()

    if (particle) {
      const color = getMomentumColor(point.momentum)
      const spread = 10 + point.normalizedVolume * 15 // Tighter spread

      resetParticle(particle, point.x, point.y, color, selectedIndex, spread)
    }
  }

  /**
   * Get all particles for rendering
   */
  getParticles(): Particle[] {
    return this.pool.getAll()
  }

  /**
   * Get active particle count
   */
  getActiveCount(): number {
    return this.pool.getActiveCount()
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.pool.clear()
  }

  /**
   * Force spawn burst of particles at specific location
   */
  spawnBurst(x: number, y: number, count: number, color: string): void {
    for (let i = 0; i < count; i++) {
      const particle = this.pool.acquire()
      if (particle) {
        resetParticle(particle, x, y, color, -1, 50)
        // Higher initial velocity for burst effect
        const angle = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 3
        particle.vx = Math.cos(angle) * speed
        particle.vy = Math.sin(angle) * speed
      }
    }
  }
}
