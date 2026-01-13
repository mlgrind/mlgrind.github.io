import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import SectionPage from './pages/SectionPage'
import ProblemPage from './pages/ProblemPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/section/:sectionId" element={<SectionPage />} />
        <Route path="/problem/:sectionId/:problemId" element={<ProblemPage />} />
      </Routes>
    </Layout>
  )
}

export default App
