import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initAuth } from './store/authStore'
import { initWebVitals } from './utils/webVitals'

// Initialize auth state from localStorage
initAuth()

// Initialize Web Vitals monitoring
initWebVitals()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)