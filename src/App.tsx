import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import SectionPage from './pages/SectionPage'
import ProblemPage from './pages/ProblemPage'
import ScratchpadPage from './pages/ScratchpadPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import FlashCardsPage from './pages/FlashCardsPage'
import NotFoundPage from './pages/NotFoundPage'
import { getProblemById } from './data/problems'

/**
 * Older sitemap/llms.txt entries published problems as `/problem/:problemId`,
 * without the section segment. Resolve those to the canonical URL instead of
 * dropping the visitor on a 404.
 */
function LegacyProblemRedirect() {
  const { problemId } = useParams<{ problemId: string }>()
  const problem = problemId ? getProblemById(problemId) : undefined

  if (!problem) return <NotFoundPage />
  return <Navigate to={`/problem/${problem.section}/${problem.id}`} replace />
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/section/:sectionId" element={<SectionPage />} />
        <Route path="/problem/:sectionId/:problemId" element={<ProblemPage />} />
        <Route path="/problem/:problemId" element={<LegacyProblemRedirect />} />
        <Route path="/scratchpad" element={<ScratchpadPage />} />
        <Route path="/flashcards" element={<FlashCardsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}

export default App
