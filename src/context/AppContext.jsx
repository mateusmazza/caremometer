import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

const AppContext = createContext(null)

/**
 * AppProvider
 *
 * Keeps only global, cross-page state:
 *   - isResearcher:  whether the current session has Firebase Auth credentials
 *   - authLoading:   true while Firebase resolves the initial auth state
 *                    (prevents login screen flash on page reload)
 */
export function AppProvider({ children }) {
  const [isResearcher, setIsResearcher] = useState(false)
  const [authLoading, setAuthLoading]   = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsResearcher(!!user)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  return (
    <AppContext.Provider value={{ isResearcher, setIsResearcher, authLoading }}>
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
