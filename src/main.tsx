import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './homepage.css'
import './depth.css'
import './pricing.css'
import './preview.css'
import './report-extras.css'
import './buyer-polish.css'
import './report-examples.css'
import './report-reader.css'
import './report-applications.css'
import './destiny-card.css'
import './entry-polish.css'
import './learning.css'
import App from './components/App.tsx'
import { recoverMissingChunk } from './utils/chunk-recovery.ts'
import { recordJourney } from './utils/journey-events.ts'
window.addEventListener('vite:preloadError', event => {
  try { recoverMissingChunk(event, window.sessionStorage, () => window.location.reload()) } catch { /* retain the existing retry screen */ }
})
recordJourney('visit')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
