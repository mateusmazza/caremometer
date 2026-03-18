import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProgressStepper from '../components/layout/ProgressStepper'
import SurveyQuestion from '../components/survey/SurveyQuestion'
import {
  demographicsQuestions,
  affordabilityQuestions,
  reasonableEffortQuestions,
  meetsNeedsQuestions,
  parentEmotionalQuestions,
  childEmotionalQuestions,
  parentCognitionQuestions,
  childCognitionQuestions,
} from '../data/questions'
import { saveExitAssessmentSection, completeExitAssessment } from '../utils/storage'

const STEPS = [
  'Current Situation',
  'Affordability',
  'Access & Effort',
  "Meets Your Needs",
  'Parent Well-being',
  'Child Well-being',
  'Parent Cognition',
  'Child Cognition',
  'Review & Submit',
]

function SurveySection({ questions, answers, setAnswers }) {
  return (
    <>
      {questions.map(q => (
        <SurveyQuestion
          key={q.id}
          question={q}
          value={answers[q.id]}
          onChange={val => setAnswers(prev => ({ ...prev, [q.id]: val }))}
        />
      ))}
    </>
  )
}

// Subset of demographics for exit (shorter)
const exitDemographics = demographicsQuestions.filter(q =>
  ['employment_status', 'household_income', 'waitlist_status', 'waitlist_count', 'housing_stability'].includes(q.id)
)

export default function ExitAssessment() {
  const { participant, refreshParticipant } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [currentSituation, setCurrentSituation] = useState({})
  const [affordability, setAffordability] = useState({})
  const [effort, setEffort] = useState({})
  const [meetsNeeds, setMeetsNeeds] = useState({})
  const [parentEmotional, setParentEmotional] = useState({})
  const [childEmotional, setChildEmotional] = useState({})
  const [parentCognition, setParentCognition] = useState({})
  const [childCognition, setChildCognition] = useState({})

  useEffect(() => {
    if (!participant) { navigate('/login'); return }
    if (!participant.entryAssessment?.completedAt) { navigate('/enroll'); return }

    // Rehydrate
    const exit = participant.exitAssessment || {}
    if (exit.currentSituation) setCurrentSituation(exit.currentSituation)
    if (exit.affordability)    setAffordability(exit.affordability)
    if (exit.effort)           setEffort(exit.effort)
    if (exit.meetsNeeds)       setMeetsNeeds(exit.meetsNeeds)
    if (exit.parentEmotional)  setParentEmotional(exit.parentEmotional)
    if (exit.childEmotional)   setChildEmotional(exit.childEmotional)
    if (exit.parentCognition)  setParentCognition(exit.parentCognition)
    if (exit.childCognition)   setChildCognition(exit.childCognition)
  }, [])

  function saveCurrentStep() {
    switch (step) {
      case 0: saveExitAssessmentSection('currentSituation', currentSituation); break
      case 1: saveExitAssessmentSection('affordability', affordability); break
      case 2: saveExitAssessmentSection('effort', effort); break
      case 3: saveExitAssessmentSection('meetsNeeds', meetsNeeds); break
      case 4: saveExitAssessmentSection('parentEmotional', parentEmotional); break
      case 5: saveExitAssessmentSection('childEmotional', childEmotional); break
      case 6: saveExitAssessmentSection('parentCognition', parentCognition); break
      case 7: saveExitAssessmentSection('childCognition', childCognition); break
    }
    refreshParticipant()
  }

  function goNext() { saveCurrentStep(); setStep(s => s + 1); window.scrollTo(0, 0) }
  function goBack() { saveCurrentStep(); setStep(s => s - 1); window.scrollTo(0, 0) }

  function handleSubmit() {
    saveCurrentStep()
    completeExitAssessment()
    refreshParticipant()
    navigate('/thank-you?type=exit')
  }

  return (
    <div className="container page">
      <h1 className="page__title">Exit Assessment</h1>
      <p className="page__subtitle">Step {step + 1} of {STEPS.length}: <strong>{STEPS[step]}</strong></p>

      <div className="alert alert--blue" style={{ background: '#dbeafe', borderColor: '#93c5fd', color: '#1e40af', marginBottom: '1.25rem' }}>
        This is the final survey of the study. Thank you for your participation!
      </div>

      <ProgressStepper steps={STEPS} current={step} />

      <div style={{ marginTop: '1.75rem' }}>
        {step === 0 && <SurveySection questions={exitDemographics} answers={currentSituation} setAnswers={setCurrentSituation} />}
        {step === 1 && <SurveySection questions={affordabilityQuestions} answers={affordability} setAnswers={setAffordability} />}
        {step === 2 && <SurveySection questions={reasonableEffortQuestions} answers={effort} setAnswers={setEffort} />}
        {step === 3 && <SurveySection questions={meetsNeedsQuestions} answers={meetsNeeds} setAnswers={setMeetsNeeds} />}
        {step === 4 && (
          <div>
            <div className="alert alert--warning" style={{ marginBottom: '1.25rem' }}><strong>⚠ Placeholder questions</strong></div>
            <SurveySection questions={parentEmotionalQuestions} answers={parentEmotional} setAnswers={setParentEmotional} />
          </div>
        )}
        {step === 5 && (
          <div>
            <div className="alert alert--warning" style={{ marginBottom: '1.25rem' }}><strong>⚠ Placeholder questions</strong></div>
            <SurveySection questions={childEmotionalQuestions} answers={childEmotional} setAnswers={setChildEmotional} />
          </div>
        )}
        {step === 6 && (
          <div>
            <div className="alert alert--warning" style={{ marginBottom: '1.25rem' }}><strong>⚠ Placeholder questions</strong></div>
            <SurveySection questions={parentCognitionQuestions} answers={parentCognition} setAnswers={setParentCognition} />
          </div>
        )}
        {step === 7 && (
          <div>
            <div className="alert alert--warning" style={{ marginBottom: '1.25rem' }}><strong>⚠ Placeholder questions</strong></div>
            <SurveySection questions={childCognitionQuestions} answers={childCognition} setAnswers={setChildCognition} />
          </div>
        )}
        {step === 8 && (
          <div>
            <div className="alert alert--success" style={{ marginBottom: '1.25rem' }}>
              You've completed all sections of the exit assessment. Click Submit to finish.
            </div>
            <div className="card">
              <p style={{ color: 'var(--gray-700)', lineHeight: 1.7 }}>
                Thank you for your participation in this study. Your responses will help us better
                understand and measure childcare precarity for families. The research team may
                follow up with you at a later date.
              </p>
              <p style={{ marginTop: '.75rem', color: 'var(--gray-600)', fontSize: '.875rem' }}>
                Questions? Contact us at <a href="mailto:mmmazzaferro@gmail.com">mmmazzaferro@gmail.com</a>.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className={`btn-row btn-row--${step === 0 ? 'right' : 'spread'}`}>
        {step > 0 && <button type="button" className="btn btn--secondary" onClick={goBack}>← Back</button>}
        {step < STEPS.length - 1
          ? <button type="button" className="btn btn--primary btn--lg" onClick={goNext}>Next →</button>
          : <button type="button" className="btn btn--primary btn--lg" onClick={handleSubmit}>Submit Exit Assessment ✓</button>
        }
      </div>
    </div>
  )
}
