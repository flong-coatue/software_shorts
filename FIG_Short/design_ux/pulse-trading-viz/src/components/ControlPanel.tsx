
interface ControlPanelProps {
  isPlaying: boolean
  onTogglePlay: () => void
  particleMultiplier: number
  onParticleMultiplierChange: (value: number) => void
  particleCount: number
}

export function ControlPanel({
  isPlaying,
  onTogglePlay,
  particleMultiplier,
  onParticleMultiplierChange,
  particleCount,
}: ControlPanelProps) {
  return (
    <div className="control-panel">
      <button onClick={onTogglePlay} title={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="2" width="4" height="12" rx="1" />
            <rect x="9" y="2" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2.5v11l9-5.5-9-5.5z" />
          </svg>
        )}
      </button>

      <div className="slider-container">
        <span className="control-label">Particles</span>
        <div className="slider-row">
          <input
            type="range"
            min="0.2"
            max="2"
            step="0.1"
            value={particleMultiplier}
            onChange={(e) => onParticleMultiplierChange(parseFloat(e.target.value))}
          />
          <span className="control-value">{particleCount}</span>
        </div>
      </div>
    </div>
  )
}
