/**
 * SurveyQuestion — unified component for all question types.
 *
 * Props:
 *   question   - question object from questions.js
 *   value      - current answer value
 *   onChange   - (newValue) => void
 */
export default function SurveyQuestion({ question, value, onChange }) {
  const { id, label, type, options, placeholder, required,
          min, max, maxLength, hint } = question

  const isPlaceholder = question.placeholder === true

  const labelEl = (
    <>
      <label className="form-label" htmlFor={id}>
        {isPlaceholder && <span className="placeholder-badge">Placeholder</span>}
        {label}
        {required && <span style={{ color: 'var(--red)', marginLeft: '.2rem' }}>*</span>}
      </label>
      {hint && <p className="form-hint">{hint}</p>}
    </>
  )

  // ── Single choice (radio) ──────────────────────────────────────────────────
  if (type === 'single') {
    return (
      <div className="form-group">
        {labelEl}
        <div className="choice-group" role="radiogroup">
          {options.map(opt => (
            <label
              key={opt.value}
              className={`choice-item${value === opt.value ? ' choice-item--selected' : ''}`}
            >
              <input
                type="radio"
                name={id}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
              />
              <span className="choice-item__label">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  // ── Multi choice (checkbox) ────────────────────────────────────────────────
  if (type === 'multi') {
    const selected = Array.isArray(value) ? value : []
    function toggle(v) {
      if (selected.includes(v)) onChange(selected.filter(x => x !== v))
      else onChange([...selected, v])
    }
    return (
      <div className="form-group">
        {labelEl}
        <div className="choice-group">
          {options.map(opt => (
            <label
              key={opt.value}
              className={`choice-item${selected.includes(opt.value) ? ' choice-item--selected' : ''}`}
            >
              <input
                type="checkbox"
                value={opt.value}
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              <span className="choice-item__label">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  // ── Likert / Scale ─────────────────────────────────────────────────────────
  if (type === 'scale') {
    return (
      <div className="form-group">
        {labelEl}
        <div className="scale-options">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`scale-option${value === opt.value ? ' scale-option--selected' : ''}`}
              onClick={() => onChange(opt.value)}
            >
              <span className="scale-option__value">{opt.value}</span>
              <span className="scale-option__label">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Dropdown / Select ──────────────────────────────────────────────────────
  if (type === 'dropdown') {
    return (
      <div className="form-group">
        {labelEl}
        <select
          id={id}
          className="form-select"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">— Select an option —</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    )
  }

  // ── Text input ─────────────────────────────────────────────────────────────
  if (type === 'text') {
    return (
      <div className="form-group">
        {labelEl}
        <input
          id={id}
          type="text"
          className="form-input"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || ''}
          maxLength={maxLength}
        />
      </div>
    )
  }

  // ── Number input ───────────────────────────────────────────────────────────
  if (type === 'number') {
    return (
      <div className="form-group">
        {labelEl}
        <input
          id={id}
          type="number"
          className="form-input"
          value={value ?? ''}
          onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder={placeholder || ''}
          min={min}
          max={max}
          style={{ maxWidth: '200px' }}
        />
      </div>
    )
  }

  // ── Date input ─────────────────────────────────────────────────────────────
  if (type === 'date') {
    const today = new Date().toISOString().slice(0, 10)
    // Reasonable minimum: 20 years ago (for older children up to ~18)
    const minDate = new Date(Date.now() - 20 * 365.25 * 24 * 3600 * 1000).toISOString().slice(0, 10)
    return (
      <div className="form-group">
        {labelEl}
        <input
          id={id}
          type="date"
          className="form-input"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          max={today}
          min={minDate}
          style={{ maxWidth: '220px' }}
        />
      </div>
    )
  }

  return null
}
