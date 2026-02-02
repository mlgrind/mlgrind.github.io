import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import SectionPage from './pages/SectionPage'
import ProblemPage from './pages/ProblemPage'
import ScratchpadPage from './pages/ScratchpadPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/section/:sectionId" element={<SectionPage />} />
        <Route path="/problem/:sectionId/:problemId" element={<ProblemPage />} />
        <Route path="/scratchpad" element={<ScratchpadPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
    </Layout>
  )
}

export default App
