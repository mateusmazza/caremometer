import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { researcherLogout } from '../../utils/storage'

// Minimal wordmark logo — a small "C" glyph mark
function LogoMark() {
  return (
    <div className="header__logo-mark">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5" stroke="white" strokeWidth="2"/>
        <path d="M10 5.5A3.5 3.5 0 1 0 10 8.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

export default function Header() {
  const { isResearcher, setIsResearcher } = useApp()
  const navigate = useNavigate()

  function handleLogout() {
    researcherLogout()
    setIsResearcher(false)
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header__inner">
        <a
          href="#/"
          className="header__logo"
          onClick={e => { e.preventDefault(); navigate('/') }}
        >
          <LogoMark />
          <span className="header__logo-text">Caremometer</span>
        </a>

        <nav className="header__nav">
          {isResearcher ? (
            <>
              <a href="#/dashboard" onClick={e => { e.preventDefault(); navigate('/dashboard') }}>
                Dashboard
              </a>
              <button onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <a href="#/dashboard" onClick={e => { e.preventDefault(); navigate('/dashboard') }}>
              Researcher
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}
