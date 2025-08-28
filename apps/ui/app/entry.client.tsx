import * as Sentry from '@sentry/react-router'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://c85c12d1ecc241558e8aa3bc55dea61f@o4505257329098752.ingest.us.sentry.io/4505257332178944',
    sendDefaultPii: true,
    integrations: [
    ],
  })
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  )
})
