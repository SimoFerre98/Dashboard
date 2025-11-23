import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const storedTheme = localStorage.getItem('dashboard_theme') || 'dark'
document.documentElement.setAttribute('data-theme', storedTheme)
if (!localStorage.getItem('dashboard_theme')) {
  localStorage.setItem('dashboard_theme', storedTheme)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
