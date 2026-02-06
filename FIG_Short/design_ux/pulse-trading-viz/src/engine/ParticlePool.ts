import { Particle, createParticle } from './Particle'

/**
 * Object pool to avoid garbage collection during animation
 */
export class ParticlePool {
  private particles: Particle[] = []
  private activeCount = 0

  constructor(initialSize: number = 1000) {
    // Pre-allocate particles
    for (let i = 0; i < initialSize; i++) {
      this.particles.push(createParticle())
    }
  }

  /**
   * Get an inactive particle from the pool
   */
  acquire(): Particle | null {
    // Find first inactive particle
    for (const particle of this.particles) {
      if (!particle.active) {
        this.activeCount++
        return particle
      }
    }

    // Pool exhausted - create new particle
    const particle = createParticle()
    this.particles.push(particle)
    this.activeCount++
    return particle
  }

  /**
   * Return particle to pool
   */
  release(particle: Particle): void {
    if (particle.active) {
      particle.active = false
      this.activeCount--
    }
  }

  /**
   * Get all particles for iteration
   */
  getAll(): Particle[] {
    return this.particles
  }

  /**
   * Get only active particles
   */
  getActive(): Particle[] {
    return this.particles.filter(p => p.active)
  }

  /**
   * Current active particle count
   */
  getActiveCount(): number {
    return this.activeCount
  }

  /**
   * Total pool size
   */
  getPoolSize(): number {
    return this.particles.length
  }

  /**
   * Deactivate all particles
   */
  clear(): void {
    for (const particle of this.particles) {
      particle.active = false
    }
    this.activeCount = 0
  }
}
