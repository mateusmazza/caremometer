import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProgressStepper from '../components/layout/ProgressStepper'
import SurveyQuestion from '../components/survey/SurveyQuestion'
import CalendarPainter from '../components/calendar/CalendarPainter'
import { weeklyCheckinQuestions, PROVIDER_TYPES, PROVIDER_COLORS } from '../data/questions'
import {
  saveWeeklyCheckin, completeWeeklyCheckin, getWeeklyCheckin,
  getLatestCheckin, getCurrentWeekId, getPast7Days,
  getParticipant, saveParticipant,
} from '../utils/storage'
import { computeAllMetrics } from '../utils/metrics'

const STEPS = ['Calendar', 'Quick Survey', 'Review']

function newProvider(index, count) {
  return {
    id: `prov_${Date.now()}_${count + index}`,
    name: '',
    type: '',
    color: PROVIDER_COLORS[(count + index) % PROVIDER_COLORS.length],
  }
}

export default function WeeklyCheckin() {
  const { participant, refreshParticipant } = useApp()
  const navigate = useNavigate()

  const weekId = getCurrentWeekId()
  const days   = getPast7Days()

  const [step, setStep] = useState(0)
  const [calendarData, setCalendarData] = useState({})
  const [providers, setProviders] = useState([])
  const [surveyAnswers, setSurveyAnswers] = useState({})
  const [showProviderEdit, setShowProviderEdit] = useState(false)

  // Previous week's data (for instability calculation)
  const [priorCalendar, setPriorCalendar] = useState(null)

  useEffect(() => {
    if (!participant) { navigate('/login'); return }
    if (!participant.entryAssessment?.completedAt) { navigate('/enroll'); return }

    // Load current week's saved data
    const saved = getWeeklyCheckin(weekId)
    if (saved?.calendarData) setCalendarData(saved.calendarData)
    if (saved?.surveyAnswers) setSurveyAnswers(saved.surveyAnswers)

    // Load providers (use this week's snapshot if already saved, else from participant)
    const providerSource = saved?.providers || participant.providers || []
    setProviders(providerSource.length > 0 ? providerSource : [])

    // Load prior week for instability
    const allCheckins = (participant.weeklyCheckins || [])
      .filter(c => c.id !== weekId && c.completedAt)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    if (allCheckins.length > 0) setPriorCalendar(allCheckins[0].calendarData || null)
  }, [])

  // ── Autosave ───────────────────────────────────────────────────────────────

  function saveProgress() {
    saveWeeklyCheckin(weekId, {
      weekStartDate: days[0],
      calendarData,
      providers,
      surveyAnswers,
    })
    refreshParticipant()
  }

  function goNext() {
    saveProgress()
    setStep(s => s + 1)
    window.scrollTo(0, 0)
  }

  function goBack() {
    saveProgress()
    setStep(s => s - 1)
    window.scrollTo(0, 0)
  }

  // ── Provider editing ───────────────────────────────────────────────────────

  function addProvider() {
    setProviders(prev => [...prev, newProvider(0, prev.length)])
  }

  function updateProvider(id, field, val) {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p))
  }

  function removeProvider(id) {
    setProviders(prev => prev.length > 1 ? prev.filter(p => p.id !== id) : prev)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  function handleSubmit() {
    const metrics = computeAllMetrics(calendarData, priorCalendar)
    saveWeeklyCheckin(weekId, {
      weekStartDate: days[0],
      calendarData,
      providers,
      surveyAnswers,
      metrics,
    })
    completeWeeklyCheckin(weekId)

    // Also persist provider list back to participant for next week's default
    saveParticipant({ providers })
    refreshParticipant()
    navigate('/thank-you?type=checkin')
  }

  // ── Computed summary ───────────────────────────────────────────────────────

  const metrics = computeAllMetrics(calendarData, priorCalendar)
  const validProviders = providers.filter(p => p.name.trim())

  // Visible survey questions (filter out the provider_changes question — handled separately)
  const surveyQuestions = weeklyCheckinQuestions.filter(q => q.id !== 'provider_changes')

  return (
    <div className="container page">
      <h1 className="page__title">Weekly Check-in</h1>
      <p className="page__subtitle">
        Week of {days[0]} — Step {step + 1} of {STEPS.length}: <strong>{STEPS[step]}</strong>
      </p>

      <ProgressStepper steps={STEPS} current={step} />

      <div style={{ marginTop: '1.75rem' }}>

        {/* ── Step 0: Calendar ──────────────────────────────────────────────── */}
        {step === 0 && (
          <div>
            <div className="card card--blue" style={{ marginBottom: '1.25rem' }}>
              <strong>Instructions:</strong> Tap or drag on the calendar to paint which provider
              cared for your child during each hour. Use the color legend below to switch providers.
              Tap a filled cell again, or select the Eraser, to clear it. On desktop you can also click and drag.
              Scroll the calendar left/right if needed.
            </div>

            {/* Provider change check */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <SurveyQuestion
                question={weeklyCheckinQuestions.find(q => q.id === 'provider_changes')}
                value={surveyAnswers.provider_changes}
                onChange={val => {
                  setSurveyAnswers(prev => ({ ...prev, provider_changes: val }))
                  if (val === 'yes') setShowProviderEdit(true)
                }}
              />
              {surveyAnswers.provider_changes === 'yes' && (
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => setShowProviderEdit(v => !v)}
                >
                  {showProviderEdit ? 'Hide provider editor' : 'Edit providers'}
                </button>
              )}
            </div>

            {/* Provider editor (only when changes reported) */}
            {showProviderEdit && (
              <div className="card" style={{ marginBottom: '1rem' }}>
                <h3 className="section__title">Update your providers</h3>
                {providers.map((p, i) => (
                  <div key={p.id} className="provider-card">
                    <div className="provider-card__header">
                      <div className="flex items-center" style={{ gap: '.5rem' }}>
                        <span className="provider-color-dot" style={{ backgroundColor: p.color }} />
                        <strong style={{ fontSize: '.875rem' }}>Provider {i + 1}</strong>
                      </div>
                      {providers.length > 1 && (
                        <button type="button" className="btn btn--ghost btn--sm" style={{ color: 'var(--red)' }} onClick={() => removeProvider(p.id)}>Remove</button>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-input" value={p.name} onChange={e => updateProvider(p.id, 'name', e.target.value)} placeholder="Provider name" />
                    </div>
                    <div style={{ display: 'flex', gap: '.375rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
                      {PROVIDER_COLORS.map(c => (
                        <button key={c} type="button" onClick={() => updateProvider(p.id, 'color', c)} style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: c, border: p.color === c ? '3px solid #0f172a' : '2px solid transparent', cursor: 'pointer' }} />
                      ))}
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn--secondary btn--sm" onClick={addProvider}>+ Add provider</button>
              </div>
            )}

            {validProviders.length === 0 ? (
              <div className="alert alert--warning">Please add at least one provider before filling the calendar.</div>
            ) : (
              <CalendarPainter
                days={days}
                providers={validProviders}
                data={calendarData}
                onChange={setCalendarData}
              />
            )}
          </div>
        )}

        {/* ── Step 1: Brief Survey ───────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            {surveyQuestions.map(q => (
              <SurveyQuestion
                key={q.id}
                question={q}
                value={surveyAnswers[q.id]}
                onChange={val => setSurveyAnswers(prev => ({ ...prev, [q.id]: val }))}
              />
            ))}
          </div>
        )}

        {/* ── Step 2: Review ────────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 className="section__title">Your calendar this week</h3>
              <CalendarPainter
                days={days}
                providers={validProviders}
                data={calendarData}
                onChange={() => {}}
                readOnly
              />
            </div>

            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 className="section__title">Computed metrics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '.75rem' }}>
                <div style={{ textAlign: 'center', padding: '.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--blue)' }}>{metrics.multiplicity}</div>
                  <div className="text-xs text-muted">Providers used</div>
                </div>
                <div style={{ textAlign: 'center', padding: '.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--blue)' }}>
                    {metrics.instability !== null ? `${Math.round(metrics.instability * 100)}%` : '—'}
                  </div>
                  <div className="text-xs text-muted">Instability vs. last week</div>
                </div>
                <div style={{ textAlign: 'center', padding: '.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--blue)' }}>
                    {metrics.entropy.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted">Entropy (bits)</div>
                </div>
                <div style={{ textAlign: 'center', padding: '.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: metrics.fillRate < 0.3 ? 'var(--amber)' : 'var(--green)' }}>
                    {Math.round(metrics.fillRate * 100)}%
                  </div>
                  <div className="text-xs text-muted">Hours filled</div>
                </div>
              </div>
              {metrics.fillRate < 0.2 && (
                <div className="alert alert--warning" style={{ marginTop: '1rem' }}>
                  Your calendar looks mostly empty. Please go back and fill in the hours when your child was in care.
                </div>
              )}
            </div>

            <div className="alert alert--info">
              Once you submit, your responses for this week will be saved.
            </div>
          </div>
        )}

      </div>

      {/* Navigation */}
      <div className={`btn-row btn-row--${step === 0 ? 'right' : 'spread'}`}>
        {step > 0 && (
          <button type="button" className="btn btn--secondary" onClick={goBack}>← Back</button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn btn--primary btn--lg" onClick={goNext} disabled={step === 0 && validProviders.length === 0}>
            {step === 0 && validProviders.length === 0 ? 'Add at least one provider first' : 'Next →'}
          </button>
        ) : (
          <button type="button" className="btn btn--primary btn--lg" onClick={handleSubmit}>
            Submit Check-in ✓
          </button>
        )}
      </div>
    </div>
  )
}
