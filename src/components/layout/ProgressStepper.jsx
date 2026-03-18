/**
 * ProgressStepper — shows the current step in a multi-step form.
 * @param {string[]} steps  - step labels
 * @param {number}   current - 0-based index of the active step
 */
export default function ProgressStepper({ steps, current }) {
  return (
    <div className="stepper" role="progressbar" aria-valuenow={current + 1} aria-valuemax={steps.length}>
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
  )
}
