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
 *
 * IRB Protocol: eProtocol #64791 (Stanford University, exempt)
 * PI: Philip Fisher | Student Researcher: Mateus Mazzaferro
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

  const sectionHead = {
    fontWeight: 700,
    fontSize: '.9375rem',
    color: 'var(--ink-1)',
    marginTop: '1.25rem',
    marginBottom: '.375rem',
  }

  const body = {
    fontSize: '.9375rem',
    lineHeight: 1.75,
    color: 'var(--ink-2)',
    marginBottom: '.5rem',
  }

  return (
    <div className="container page">
      <div className="instrument-badge">
        <span className="instrument-badge__dot" />
        Step 1 of 3 — Enrollment
      </div>

      <h1 className="page__title">Consent to Participate in Research</h1>
      <p className="page__subtitle">
        Please read this information carefully before joining the study.
      </p>

      <div className="card" style={{ marginBottom: '1.5rem', lineHeight: 1.75 }}>

        <p style={{ ...body, marginTop: 0 }}>
          <strong>Study title:</strong> Caremometer — Measuring Childcare Precarity<br />
          <strong>Principal Investigator:</strong> Philip Fisher, Ph.D., Stanford Graduate School of Education<br />
          <strong>Student Researcher:</strong> Mateus Mazzaferro, Stanford Graduate School of Education<br />
          <strong>Contact:</strong>{' '}
          <a href="mailto:mmmazzaferro@gmail.com">mmmazzaferro@gmail.com</a>
        </p>

        <h3 style={sectionHead}>Purpose</h3>
        <p style={body}>
          We are studying childcare precarity — the degree to which families struggle to find,
          afford, and maintain reliable childcare. This study will help researchers and
          policymakers better understand how childcare instability affects families over time.
          Participation involves completing an enrollment survey, brief weekly check-ins, and
          an exit survey.
        </p>

        <h3 style={sectionHead}>What participation involves</h3>
        <ul style={{ paddingLeft: '1.25rem', ...body }}>
          <li><strong>Enrollment survey (~30 min)</strong> — questions about you, your child(ren), and your childcare arrangements.</li>
          <li><strong>Weekly check-ins (~5 min each)</strong> — a short calendar-based log of your childcare schedule, completed over several weeks.</li>
          <li><strong>Exit survey (~30 min)</strong> — a final set of questions at the end of the study period.</li>
        </ul>

        <h3 style={sectionHead}>Risks</h3>
        <p style={body}>
          The risks of participating are minimal. Some questions ask about income, childcare
          costs, and family stress, which some people find sensitive. You may skip any question
          you prefer not to answer.
        </p>

        <h3 style={sectionHead}>Benefits</h3>
        <p style={body}>
          There is no direct benefit to you for participating. Your responses will contribute to
          research that may improve childcare policy and support for families in the future.
        </p>

        <h3 style={sectionHead}>Confidentiality</h3>
        <p style={body}>
          Your responses will be de-identified before any analysis or reporting. Your contact
          information (email, phone) is stored separately from your survey responses and will
          never appear in research data exports or be shared with third parties. Study data is
          stored securely and accessed only by the research team.
        </p>

        <h3 style={sectionHead}>Voluntary participation</h3>
        <p style={body}>
          Participation is entirely voluntary. You may decline to answer any question and may
          withdraw from the study at any time without penalty or loss of any benefits to which
          you are otherwise entitled.
        </p>

        <h3 style={sectionHead}>Questions or concerns</h3>
        <p style={{ ...body, marginBottom: 0 }}>
          For questions about the study, contact the research team at{' '}
          <a href="mailto:mmmazzaferro@gmail.com">mmmazzaferro@gmail.com</a>.
          For questions about your rights as a research participant, contact the Stanford
          Institutional Review Board (IRB) at{' '}
          <a href="mailto:irb2-manager@stanford.edu">irb2-manager@stanford.edu</a>{' '}
          or (650) 723-2480.
        </p>

      </div>

      <form onSubmit={handleConsent}>
        <div className="card">
          <label className="choice-item" style={{ cursor: 'pointer', alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: '.25rem', flexShrink: 0 }}
            />
            <span className="choice-item__label">
              I have read and understood the information above. I am 18 years of age or older,
              and I voluntarily agree to participate in this research study. I understand I can
              withdraw at any time without penalty.
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
