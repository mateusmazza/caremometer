import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { researcherLogout } from '../../utils/storage'
import logo from '../../assets/caremometer-logo.png'

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
          <img src={logo} alt="Caremometer" style={{ height: '28px', width: 'auto' }} />
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
