/**
 * ProgressStepper — shows the current step in a multi-step form.
 *
 * On desktop (≥ 641 px): renders a horizontal dot/line stepper.
 * On mobile  (≤ 640 px): renders a compact progress bar + current step label.
 *
 * @param {string[]} steps   - step labels
 * @param {number}   current - 0-based index of the active step
 */
export default function ProgressStepper({ steps, current }) {
  const pct = Math.round(((current + 1) / steps.length) * 100)

  return (
    <>
      {/* ── Desktop: dot stepper ─────────────────────────────────────────── */}
      <div
        className="stepper stepper--dots"
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemax={steps.length}
        aria-label={`Step ${current + 1} of ${steps.length}`}
      >
        {steps.map((label, i) => {
          const isComplete = i < current
          const isActive   = i === current
          return (
            <div className="stepper__step" key={i}>
              {i > 0 && (
                <div className={`stepper__line${isComplete ? ' stepper__line--complete' : ''}`} />
              )}
              <div
                className={`stepper__dot${isActive ? ' stepper__dot--active' : ''}${isComplete ? ' stepper__dot--complete' : ''}`}
                title={label}
              >
                {isComplete ? '✓' : i + 1}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Mobile: progress bar ─────────────────────────────────────────── */}
      <div
        className="stepper stepper--bar"
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemax={steps.length}
        aria-label={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}
      >
        <div className="stepper__bar-track">
          <div className="stepper__bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="stepper__bar-label">
          <span className="stepper__bar-step-name">{steps[current]}</span>
          <span className="stepper__bar-count">{current + 1} / {steps.length}</span>
        </div>
      </div>
    </>
  )
}
