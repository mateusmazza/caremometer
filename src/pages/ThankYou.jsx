import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ThankYou() {
  const { participant } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const type = params.get('type') // 'entry' | 'checkin' | 'exit'

  const messages = {
    entry: {
      title: 'Enrollment Complete!',
      body: 'Thank you for completing the enrollment survey. You\'ll receive a text message reminder each week when it\'s time to complete your weekly check-in.',
      next: 'Complete this week\'s check-in',
      nextPath: '/checkin',
    },
    checkin: {
      title: 'Check-in Submitted!',
      body: 'Thank you for completing your weekly check-in. You\'ll hear from us again next week.',
      next: 'View your check-in history',
      nextPath: '/checkin',
    },
    exit: {
      title: 'Study Complete — Thank You!',
      body: 'You\'ve completed all parts of the study. Your participation is greatly appreciated and will help improve childcare policy and support for families like yours.',
      next: null,
      nextPath: null,
    },
  }

  const msg = messages[type] || messages.entry

  return (
    <div className="container page" style={{ maxWidth: '560px', textAlign: 'center' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
      <h1 className="page__title">{msg.title}</h1>
      <p style={{ color: 'var(--gray-600)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.7 }}>
        {msg.body}
      </p>

      <div className="btn-row" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn--secondary" onClick={() => navigate('/')}>
          Home
        </button>
        {msg.next && (
          <button type="button" className="btn btn--primary btn--lg" onClick={() => navigate(msg.nextPath)}>
            {msg.next} →
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
