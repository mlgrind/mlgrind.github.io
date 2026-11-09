import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ProgressProvider } from './context/ProgressContext'
import './index.css'

// Remove the boot splash (index.html) once React has committed the real page.
function BootSplashRemover() {
  useEffect(() => {
    const el = document.getElementById('boot-splash')
    if (!el) return
    el.style.opacity = '0'
    const t = window.setTimeout(() => el.remove(), 200)
    return () => window.clearTimeout(t)
  }, [])
  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter basename="/">
        <AuthProvider>
          <ProgressProvider>
            <App />
            <BootSplashRemover />
          </ProgressProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
