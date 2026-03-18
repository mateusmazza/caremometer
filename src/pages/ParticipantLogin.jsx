import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { isAllowedParticipant, getParticipant, createParticipant } from '../utils/storage'

export default function ParticipantLogin() {
  const { setParticipant } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const trimmed = email.trim().toLowerCase()

    if (!trimmed) {
      setError('Please enter your email address.')
      return
    }
    if (!isAllowedParticipant(trimmed)) {
      setError('This email address is not registered for the study. If you believe this is an error, please contact the research team.')
      return
    }

    setLoading(true)
    // Check if participant already exists in storage
    let participant = getParticipant()
    if (!participant || participant.email !== trimmed) {
      participant = createParticipant(trimmed)
    }
    setParticipant(participant)

    // Route based on where they are in the study
    if (!participant.consentGiven) {
      navigate('/consent')
    } else if (!participant.entryAssessment?.completedAt) {
      navigate('/enroll')
    } else {
      navigate('/checkin')
    }
  }

  return (
    <div className="container page">
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        <h1 className="page__title">Sign in to the Study</h1>
        <p className="page__subtitle">
          Enter the email address you registered with to continue.
        </p>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            {error && (
              <div className="alert alert--error">{error}</div>
            )}

            <button
              type="submit"
              className="btn btn--primary btn--lg"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Loading…' : 'Continue →'}
            </button>
          </form>
        </div>

        <p className="text-sm text-muted text-center mt-2">
          Not registered for the study?{' '}
          <a href="mailto:mmmazzaferro@gmail.com">Contact the research team</a>
        </p>
      </div>
    </div>
  )
}
