import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './homepage.css'
import './depth.css'
import './pricing.css'
import './preview.css'
import './report-extras.css'
import './buyer-polish.css'
import App from './components/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
