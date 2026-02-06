export const COLORS = {
  background: '#0A0A0F',
  backgroundAlt: '#0F0F18',
  grid: 'rgba(100, 100, 150, 0.08)',
  gridAccent: 'rgba(100, 100, 150, 0.15)',

  cool: '#4DD4D4',      // Muted cyan - downtrend
  neutral: '#9999CC',   // Muted purple - neutral
  hot: '#DD66DD',       // Muted magenta - uptrend

  hotspotCore: '#FFFFFF',
  hotspotGlow: 'rgba(255, 255, 255, 0.2)',

  text: '#E0E0F0',
  textDim: '#808090',

  volumeFog: 'rgba(100, 100, 200, 0.03)',
} as const

export const PARTICLE_CONFIG = {
  baseCount: 300,
  minParticleRadius: 1,
  maxParticleRadius: 2,
  friction: 0.95,
  attractionStrength: 0.12,
  noiseAmount: 0.08,
  gravityWellRadius: 80,
  gravityWellStrength: 0.08,
  hotspotPulseSpeed: 0.002,
  hotspotSize: 6,
  trailLength: 0.2,
} as const

export const MOMENTUM_THRESHOLD = 0.03 // 3% for full color saturation
