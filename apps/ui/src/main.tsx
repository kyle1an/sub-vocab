import * as Sentry from '@sentry/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App.tsx'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://c85c12d1ecc241558e8aa3bc55dea61f@o4505257329098752.ingest.sentry.io/4505257332178944',
    sendDefaultPii: true,
    integrations: [
    ],
  })
}

const root = document.getElementById('root')
if (!root) {
  throw new Error('No root element')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
