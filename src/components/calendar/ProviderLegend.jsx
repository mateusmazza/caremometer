/**
 * ProviderLegend — clickable color palette for selecting a painting tool.
 *
 * Props:
 *   providers    - [{ id, name, color }]
 *   selectedTool - currently selected providerId | 'eraser'
 *   onSelect     - (providerId | 'eraser') => void
 */
export default function ProviderLegend({ providers, selectedTool, onSelect }) {
  return (
    <div className="legend">
      <span className="legend-label">Paint with:</span>

      {providers.map(p => (
        <button
          key={p.id}
          type="button"
          className={`legend-item${selectedTool === p.id ? ' legend-item--selected' : ''}`}
          style={{
            backgroundColor: p.color + '22',
            borderColor: p.color,
            color: p.color,
          }}
          onClick={() => onSelect(p.id)}
          title={`Select ${p.name}`}
        >
          <span className="legend-dot" style={{ backgroundColor: p.color }} />
          {p.name}
        </button>
      ))}

      <button
        type="button"
        className={`legend-item legend-item--eraser${selectedTool === 'eraser' ? ' legend-item--selected' : ''}`}
        onClick={() => onSelect('eraser')}
        title="Eraser — clear cells"
      >
        ✕ Eraser
      </button>
    </div>
  )
}
