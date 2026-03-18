import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Welcome         from './pages/Welcome'
import ParticipantLogin from './pages/ParticipantLogin'
import ResearcherLogin  from './pages/ResearcherLogin'
import Consent         from './pages/Consent'
import EntryAssessment from './pages/EntryAssessment'
import WeeklyCheckin   from './pages/WeeklyCheckin'
import ExitAssessment  from './pages/ExitAssessment'
import Dashboard       from './pages/Dashboard'
import ThankYou        from './pages/ThankYou'
import './App.css'

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="app-shell">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/"           element={<Welcome />} />
              <Route path="/login"      element={<ParticipantLogin />} />
              <Route path="/researcher" element={<ResearcherLogin />} />
              <Route path="/consent"    element={<Consent />} />
              <Route path="/enroll"     element={<EntryAssessment />} />
              <Route path="/checkin"    element={<WeeklyCheckin />} />
              <Route path="/exit"       element={<ExitAssessment />} />
              <Route path="/dashboard"  element={<Dashboard />} />
              <Route path="/thank-you"  element={<ThankYou />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AppProvider>
  )
}
