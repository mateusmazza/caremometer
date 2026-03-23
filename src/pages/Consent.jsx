import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  getParticipant, createParticipant, saveConsent,
} from '../utils/storage'

/**
 * Consent page — first stop in the entry flow.
 *
 * Expected URL: /consent?pid=P001
 *
 * If no pid is in the URL, shows an error directing the participant to use
 * their personal study link. If consent has already been given, redirects
 * straight to the entry assessment.
 */
export default function Consent() {
  const navigate = useNavigate()
  const [params]  = useSearchParams()
  const pid       = params.get('pid')
  const [agreed, setAgreed] = useState(false)

  if (!pid) {
    return (
      <div className="container page">
        <div className="no-pid">
          <p className="no-pid__title">No participant link found</p>
          <p className="no-pid__body">
            Please use the personal study link provided by the research team.
            It should look like <code>…/consent?pid=YOURCODE</code>.
            If you need help, contact{' '}
            <a href="mailto:mmmazzaferro@gmail.com">the research team</a>.
          </p>
        </div>
      </div>
    )
  }

  // Auto-create participant record on first visit
  let participant = getParticipant(pid)
  if (!participant) participant = createParticipant(pid)

  // Already consented — skip ahead
  if (participant.consentGiven) {
    navigate(`/entry?pid=${pid}`)
    return null
  }

  function handleConsent(e) {
    e.preventDefault()
    if (!agreed) return
    saveConsent(pid)
    navigate(`/entry?pid=${pid}`)
  }

  return (
    <div className="container page">
      <div className="instrument-badge">
        <span className="instrument-badge__dot" />
        Step 1 of 3 — Enrollment
      </div>

      <h1 className="page__title">Informed Consent</h1>
      <p className="page__subtitle">
        Please read the following information carefully before participating.
      </p>

      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          lineHeight: 1.75,
          color: 'var(--ink-2)',
          fontSize: '.9375rem',
        }}
      >
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--ink-1)' }}>
          Caremometer — Measuring Childcare Precarity
        </h2>

        <p style={{ marginBottom: '1rem' }}>
          <strong>Principal Investigator:</strong> Mateus Mazzaferro,
          Stanford Graduate School of Education
        </p>

        <h3 style={{ fontWeight: 600, fontSize: '.9375rem', marginBottom: '.5rem', color: 'var(--ink-1)' }}>Purpose</h3>
        <p style={{ marginBottom: '1rem' }}>
          This study develops and tests a measure of childcare precarity — the degree to which
          a family's childcare arrangements are unstable, unreliable, or misaligned with their
          needs. Your participation will help us understand how childcare insecurity affects
          families and inform better policy and support systems.
        </p>

        <h3 style={{ fontWeight: 600, fontSize: '.9375rem', marginBottom: '.5rem', color: 'var(--ink-1)' }}>What you will do</h3>
        <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem', lineHeight: 1.85 }}>
          <li><strong>Enrollment survey (~30 min)</strong> — Background, childcare providers, and well-being.</li>
          <li><strong>Weekly check-ins (~5 min)</strong> — An interactive calendar of your childcare schedule for several weeks.</li>
          <li><strong>Exit survey (~30 min)</strong> — A final assessment at the end of the study period.</li>
        </ul>

        <h3 style={{ fontWeight: 600, fontSize: '.9375rem', marginBottom: '.5rem', color: 'var(--ink-1)' }}>Risks</h3>
        <p style={{ marginBottom: '1rem' }}>
          Minimal risk. Some questions touch on sensitive topics such as income, housing, and
          family stress. You may skip any question you prefer not to answer.
        </p>

        <h3 style={{ fontWeight: 600, fontSize: '.9375rem', marginBottom: '.5rem', color: 'var(--ink-1)' }}>Confidentiality</h3>
        <p style={{ marginBottom: '1rem' }}>
          This is a research prototype and is not yet IRB-approved. Data is stored locally in
          your browser and is not transmitted to a server at this time. All data will be handled
          in accordance with Stanford University's research ethics guidelines once IRB approval
          is obtained.
        </p>

        <h3 style={{ fontWeight: 600, fontSize: '.9375rem', marginBottom: '.5rem', color: 'var(--ink-1)' }}>Voluntary participation</h3>
        <p>
          Your participation is completely voluntary. You may stop at any time without penalty.
          Questions? Contact the research team at{' '}
          <a href="mailto:mmmazzaferro@gmail.com">mmmazzaferro@gmail.com</a>.
        </p>
      </div>

      <form onSubmit={handleConsent}>
        <div className="card">
          <label className="choice-item" style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: '.125rem' }}
            />
            <span className="choice-item__label">
              I have read the information above and I voluntarily agree to participate
              in this research study. I understand I can withdraw at any time.
            </span>
          </label>
        </div>

        <div className="btn-row btn-row--right">
          <button
            type="submit"
            className="btn btn--primary btn--lg"
            disabled={!agreed}
          >
            I agree — begin enrollment
          </button>
        </div>
      </form>
    </div>
  )
}
