import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ProgressStepper from '../components/layout/ProgressStepper'
import SurveyQuestion  from '../components/survey/SurveyQuestion'
import {
  demographicsQuestions,
  affordabilityQuestions,
  reasonableEffortQuestions,
  meetsNeedsQuestions,
  parentCognitionQuestions,
  childCognitionQuestions,
} from '../data/questions'
import {
  getParticipant,
  saveExitAssessmentSection,
  completeExitAssessment,
} from '../utils/storage'

/**
 * Exit Assessment (Instrument 3)
 *
 * Expected URL: /exit?pid=P001
 * Redirects if the participant has not completed enrollment.
 */

const STEPS = [
  'Current Situation',
  'Affordability',
  'Access & Effort',
  'Meets Your Needs',
  'Parent Cognition',
  'Child Cognition',
  'Submit',
]

// A short subset of demographics for the exit survey
const exitDemographics = demographicsQuestions.filter(q =>
  ['employment_status', 'household_income', 'waitlist_status', 'waitlist_count', 'housing_stability'].includes(q.id)
)

function SurveySection({ questions, answers, setAnswers }) {
  return (
    <>
      {questions.map(q => (
        <SurveyQuestion
          key={q.id}
          question={q}
          value={answers[q.id]}
          allAnswers={answers}
          onChange={val => setAnswers(prev => ({ ...prev, [q.id]: val }))}
        />
      ))}
    </>
  )
}

export default function ExitAssessment() {
  const navigate  = useNavigate()
  const [params]  = useSearchParams()
  const pid       = params.get('pid')

  const [loading, setLoading]                        = useState(Boolean(pid))
  const [step, setStep]                              = useState(0)
  const [currentSituation, setCurrentSituation]     = useState({})
  const [affordability, setAffordability]            = useState({})
  const [effort, setEffort]                          = useState({})
  const [meetsNeeds, setMeetsNeeds]                  = useState({})
  const [parentCognition, setParentCognition]        = useState({})
  const [childCognition, setChildCognition]          = useState({})

  useEffect(() => {
    if (!pid) return

    let isActive = true

    ;(async () => {
      const p = await getParticipant(pid)
      if (!isActive) return
      if (!p) { navigate(`/consent?pid=${pid}`); return }
      if (!p.entryAssessment?.completedAt) { navigate(`/entry?pid=${pid}`); return }

      const exit = p.exitAssessment || {}
      setCurrentSituation(exit.currentSituation || {})
      setAffordability(exit.affordability || {})
      setEffort(exit.effort || {})
      setMeetsNeeds(exit.meetsNeeds || {})
      setParentCognition(exit.parentCognition || {})
      setChildCognition(exit.childCognition || {})
      setLoading(false)
    })()

    return () => {
      isActive = false
    }
  }, [pid, navigate])

  // Guard
  if (!pid) {
    return (
      <div className="container page">
        <div className="no-pid">
          <p className="no-pid__title">No participant link found</p>
          <p className="no-pid__body">
            Please use the exit survey link provided by the research team.
            If you need help, contact{' '}
            <a href="mailto:mmmazzaferro@gmail.com">the research team</a>.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p className="text-muted">Loading…</p>
      </div>
    )
  }

  async function saveCurrentStep() {
    switch (step) {
      case 0: await saveExitAssessmentSection(pid, 'currentSituation', currentSituation); break
      case 1: await saveExitAssessmentSection(pid, 'affordability',    affordability);    break
      case 2: await saveExitAssessmentSection(pid, 'effort',           effort);           break
      case 3: await saveExitAssessmentSection(pid, 'meetsNeeds',       meetsNeeds);       break
      case 4: await saveExitAssessmentSection(pid, 'parentCognition',  parentCognition);  break
      case 5: await saveExitAssessmentSection(pid, 'childCognition',   childCognition);   break
      default: break
    }
  }

  async function goNext()  { await saveCurrentStep(); setStep(s => s + 1); window.scrollTo(0, 0) }
  async function goBack()  { await saveCurrentStep(); setStep(s => s - 1); window.scrollTo(0, 0) }

  async function handleSubmit() {
    await saveCurrentStep()
    await completeExitAssessment(pid)
    navigate(`/thank-you?type=exit&pid=${pid}`)
  }

  return (
    <div className="container page">
      <div className="instrument-badge">
        <span className="instrument-badge__dot" />
        Instrument 3 of 3 — Exit Assessment
      </div>

      <h1 className="page__title">Exit Assessment</h1>
      <p className="page__subtitle">
        Step {step + 1} of {STEPS.length}: <strong>{STEPS[step]}</strong>
      </p>

      <div className="alert alert--info" style={{ marginBottom: '1.25rem' }}>
        This is the final survey of the study. Thank you for your participation.
      </div>

      <ProgressStepper steps={STEPS} current={step} />

      <div style={{ marginTop: '1.75rem' }}>
        {step === 0 && (
          <SurveySection
            questions={exitDemographics}
            answers={currentSituation}
            setAnswers={setCurrentSituation}
          />
        )}
        {step === 1 && (
          <SurveySection
            questions={affordabilityQuestions}
            answers={affordability}
            setAnswers={setAffordability}
          />
        )}
        {step === 2 && (
          <SurveySection
            questions={reasonableEffortQuestions}
            answers={effort}
            setAnswers={setEffort}
          />
        )}
        {step === 3 && (
          <SurveySection
            questions={meetsNeedsQuestions}
            answers={meetsNeeds}
            setAnswers={setMeetsNeeds}
          />
        )}
        {step === 4 && (
          <div>
            <div className="alert alert--warning">
              <strong>Placeholder questions</strong> — To be replaced with a validated instrument.
            </div>
            <SurveySection
              questions={parentCognitionQuestions}
              answers={parentCognition}
              setAnswers={setParentCognition}
            />
          </div>
        )}
        {step === 5 && (
          <div>
            <div className="alert alert--warning">
              <strong>Placeholder questions</strong> — To be replaced with a validated instrument.
            </div>
            <SurveySection
              questions={childCognitionQuestions}
              answers={childCognition}
              setAnswers={setChildCognition}
            />
          </div>
        )}
        {step === 6 && (
          <div>
            <div className="alert alert--success">
              You've completed all sections of the exit assessment. Click Submit to finish.
            </div>
            <div className="card">
              <p style={{ color: 'var(--ink-2)', lineHeight: 1.75, fontSize: '.9375rem' }}>
                Thank you for your participation in this study. Your responses will help us
                better understand and measure childcare precarity for families. The research
                team may follow up with you at a later date.
              </p>
              <p style={{ marginTop: '.75rem', color: 'var(--ink-3)', fontSize: '.875rem' }}>
                Questions? Contact us at{' '}
                <a href="mailto:mmmazzaferro@gmail.com">mmmazzaferro@gmail.com</a>.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className={`btn-row btn-row--${step === 0 ? 'right' : 'spread'}`}>
        {step > 0 && (
          <button type="button" className="btn btn--secondary" onClick={goBack}>
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn btn--primary btn--lg" onClick={goNext}>
            Continue
          </button>
        ) : (
          <button type="button" className="btn btn--primary btn--lg" onClick={handleSubmit}>
            Submit exit assessment
          </button>
        )}
      </div>
    </div>
  )
}
