import { useNavigate, useSearchParams } from 'react-router-dom'

// Simple checkmark SVG — no emoji
function CheckIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: '1.25rem' }}>
      <circle cx="24" cy="24" r="24" fill="var(--accent-pale)" />
      <path
        d="M14 24l8 8 12-16"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const MESSAGES = {
  entry: {
    label:    'Enrollment complete',
    title:    'You\'re enrolled',
    body:     'Thank you for completing the enrollment survey. The research team will send you a check-in reminder each week.',
    next:     'Complete this week\'s check-in',
    nextPath: (pid) => `/checkin?pid=${pid}`,
  },
  checkin: {
    label:    'Check-in submitted',
    title:    'Check-in saved',
    body:     'Thank you for completing your weekly check-in. You\'ll hear from the research team again next week.',
    next:     null,
    nextPath: null,
  },
  exit: {
    label:    'Study complete',
    title:    'Thank you',
    body:     'You\'ve completed all parts of the study. Your participation is greatly appreciated and will help improve childcare policy and support for families.',
    next:     null,
    nextPath: null,
  },
}

export default function ThankYou() {
  const navigate   = useNavigate()
  const [params]   = useSearchParams()
  const type       = params.get('type') || 'entry'
  const pid        = params.get('pid')
  const msg        = MESSAGES[type] || MESSAGES.entry

  return (
    <div
      className="container page"
      style={{ maxWidth: '540px', textAlign: 'center' }}
    >
      <div className="instrument-badge" style={{ justifyContent: 'center' }}>
        <span className="instrument-badge__dot" style={{ background: 'var(--green)' }} />
        {msg.label}
      </div>

      <CheckIcon />

      <h1 className="page__title" style={{ marginBottom: '.75rem' }}>{msg.title}</h1>
      <p style={{
        color: 'var(--ink-3)', fontSize: '1rem',
        marginBottom: '2.25rem', lineHeight: 1.7,
      }}>
        {msg.body}
      </p>

      <div className="btn-row btn-row--center">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => navigate('/')}
        >
          Home
        </button>
        {msg.next && pid && (
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() => navigate(msg.nextPath(pid))}
          >
            {msg.next}
          </button>
        )}
      </div>

      <hr className="divider" />
      <p className="text-sm text-muted">
        Questions? Contact the research team at{' '}
        <a href="mailto:mmmazzaferro@gmail.com">mmmazzaferro@gmail.com</a>
      </p>
    </div>
  )
}
