import { createContext, useContext, useState, useEffect } from 'react'
import { getParticipant, getResearcherAuth } from '../utils/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [participant, setParticipant] = useState(null)
  const [isResearcher, setIsResearcher] = useState(false)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const p = getParticipant()
    if (p) setParticipant(p)

    const r = getResearcherAuth()
    if (r?.authenticated) setIsResearcher(true)

    setLoading(false)
  }, [])

  // Refresh participant data from storage (call this after any save)
  function refreshParticipant() {
    const p = getParticipant()
    setParticipant(p)
    return p
  }

  return (
    <AppContext.Provider value={{
      participant,
      setParticipant,
      refreshParticipant,
      isResearcher,
      setIsResearcher,
      loading,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
