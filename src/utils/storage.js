/**
 * Storage abstraction layer — currently backed by localStorage.
 * All functions are designed to have the same interface as Firebase would use,
 * making it straightforward to swap out localStorage for Firestore later.
 *
 * TEST PARTICIPANT (MVP prototype):
 *   Email: mmmazzaferro@gmail.com
 *   Phone: 646-821-2183
 */

const KEYS = {
  PARTICIPANT: 'cpt_participant',
  RESEARCHER_AUTH: 'cpt_researcher_auth',
}

// ── Participant ────────────────────────────────────────────────────────────────

export function getParticipant() {
  try {
    const raw = localStorage.getItem(KEYS.PARTICIPANT)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveParticipant(data) {
  const existing = getParticipant() || {}
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
  localStorage.setItem(KEYS.PARTICIPANT, JSON.stringify(updated))
  return updated
}

export function createParticipant(email) {
  const participant = {
    id: 'P001',
    email,
    enrolledAt: new Date().toISOString(),
    status: 'active',
    consentGiven: false,
    providers: [],
    entryAssessment: null,
    exitAssessment: null,
    weeklyCheckins: [],
  }
  localStorage.setItem(KEYS.PARTICIPANT, JSON.stringify(participant))
  return participant
}

// ── Consent ────────────────────────────────────────────────────────────────────

export function saveConsent() {
  return saveParticipant({
    consentGiven: true,
    consentGivenAt: new Date().toISOString(),
  })
}

// ── Providers ──────────────────────────────────────────────────────────────────

export function saveProviders(providers) {
  return saveParticipant({ providers })
}

// ── Entry Assessment ───────────────────────────────────────────────────────────

export function saveEntryAssessmentSection(section, data) {
  const participant = getParticipant()
  const existing = participant?.entryAssessment || {}
  const updated = {
    ...existing,
    [section]: data,
    lastUpdatedAt: new Date().toISOString(),
  }
  return saveParticipant({ entryAssessment: updated })
}

export function completeEntryAssessment() {
  const participant = getParticipant()
  const updated = {
    ...participant?.entryAssessment,
    completedAt: new Date().toISOString(),
  }
  return saveParticipant({ entryAssessment: updated })
}

// ── Weekly Check-ins ───────────────────────────────────────────────────────────

export function saveWeeklyCheckin(weekId, data) {
  const participant = getParticipant()
  const checkins = participant?.weeklyCheckins || []
  const existingIndex = checkins.findIndex(c => c.id === weekId)
  const checkin = {
    id: weekId,
    ...data,
    updatedAt: new Date().toISOString(),
  }
  if (existingIndex >= 0) {
    checkins[existingIndex] = { ...checkins[existingIndex], ...checkin }
  } else {
    checkins.push(checkin)
  }
  return saveParticipant({ weeklyCheckins: checkins })
}

export function completeWeeklyCheckin(weekId) {
  const participant = getParticipant()
  const checkins = participant?.weeklyCheckins || []
  const idx = checkins.findIndex(c => c.id === weekId)
  if (idx >= 0) {
    checkins[idx] = { ...checkins[idx], completedAt: new Date().toISOString() }
    return saveParticipant({ weeklyCheckins: checkins })
  }
}

export function getWeeklyCheckin(weekId) {
  const participant = getParticipant()
  return participant?.weeklyCheckins?.find(c => c.id === weekId) || null
}

export function getLatestCheckin() {
  const participant = getParticipant()
  const checkins = participant?.weeklyCheckins || []
  if (checkins.length === 0) return null
  return checkins.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
}

// ── Exit Assessment ────────────────────────────────────────────────────────────

export function saveExitAssessmentSection(section, data) {
  const participant = getParticipant()
  const existing = participant?.exitAssessment || {}
  const updated = {
    ...existing,
    [section]: data,
    lastUpdatedAt: new Date().toISOString(),
  }
  return saveParticipant({ exitAssessment: updated })
}

export function completeExitAssessment() {
  const participant = getParticipant()
  const updated = {
    ...participant?.exitAssessment,
    completedAt: new Date().toISOString(),
  }
  return saveParticipant({ exitAssessment: updated, status: 'completed' })
}

// ── Researcher Auth ────────────────────────────────────────────────────────────

const RESEARCHER_PASSWORD = import.meta.env.VITE_RESEARCHER_PASSWORD || 'precarity-research-2025'

export function researcherLogin(password) {
  if (password === RESEARCHER_PASSWORD) {
    const auth = { authenticated: true, authenticatedAt: new Date().toISOString() }
    localStorage.setItem(KEYS.RESEARCHER_AUTH, JSON.stringify(auth))
    return true
  }
  return false
}

export function getResearcherAuth() {
  try {
    const raw = localStorage.getItem(KEYS.RESEARCHER_AUTH)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function researcherLogout() {
  localStorage.removeItem(KEYS.RESEARCHER_AUTH)
}

// ── Data Export (for researcher dashboard) ─────────────────────────────────────

export function exportParticipantCSV() {
  const participant = getParticipant()
  if (!participant) return null

  const rows = []
  const entry = participant.entryAssessment || {}
  const demographics = entry.demographics || {}

  // One row per weekly check-in × day × hour
  const checkins = participant.weeklyCheckins || []
  for (const checkin of checkins) {
    const calendarData = checkin.calendarData || {}
    for (const [date, hours] of Object.entries(calendarData)) {
      for (const [hour, providerId] of Object.entries(hours)) {
        const provider = participant.providers?.find(p => p.id === providerId)
        rows.push({
          participant_id: participant.id,
          participant_email: participant.email,
          enrolled_at: participant.enrolledAt,
          child_age: demographics.child_age || '',
          race_ethnicity: Array.isArray(demographics.race_ethnicity)
            ? demographics.race_ethnicity.join(';') : (demographics.race_ethnicity || ''),
          household_income: demographics.household_income || '',
          urbanicity: demographics.urbanicity || '',
          zip_code: demographics.zip_code || '',
          employment_status: demographics.employment_status || '',
          week_id: checkin.id,
          week_start_date: checkin.weekStartDate || '',
          checkin_completed_at: checkin.completedAt || '',
          date,
          hour: Number(hour),
          provider_id: providerId || '',
          provider_name: provider?.name || (providerId ? 'Unknown' : ''),
          provider_type: provider?.type || '',
          multiplicity: checkin.metrics?.multiplicity ?? '',
          instability: checkin.metrics?.instability ?? '',
          entropy: checkin.metrics?.entropy ?? '',
        })
      }
    }
  }

  if (rows.length === 0) return null

  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => JSON.stringify(String(row[h] ?? ''))).join(',')
    ),
  ].join('\n')

  return csv
}

// ── Week ID helpers ────────────────────────────────────────────────────────────

export function getCurrentWeekId() {
  // Week ID is based on the Monday of the current week
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return `week_${monday.toISOString().slice(0, 10)}`
}

export function getPast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

// ── Auth check: is this email the test participant? ────────────────────────────

const ALLOWED_EMAILS = ['mmmazzaferro@gmail.com']

export function isAllowedParticipant(email) {
  return ALLOWED_EMAILS.includes(email.toLowerCase().trim())
}
