import { createContext, useContext, useState, useEffect } from 'react'
import { getResearcherAuth } from '../utils/storage'

const AppContext = createContext(null)

/**
 * AppProvider
 *
 * Keeps only global, cross-page state:
 *   - isResearcher: whether the current session has researcher access
 *
 * Participant data is NOT stored here. Each instrument page (entry, check-in,
 * exit) reads the participant ID from the URL (?pid=…) and talks directly to
 * the storage layer, which is keyed by that ID. This keeps each instrument
 * self-contained and mirrors how they will behave as separate Qualtrics surveys.
 */
export function AppProvider({ children }) {
  const [isResearcher, setIsResearcher] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = getResearcherAuth()
    if (r?.authenticated) setIsResearcher(true)
    setLoading(false)
  }, [])

  return (
    <AppContext.Provider value={{ isResearcher, setIsResearcher, loading }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
