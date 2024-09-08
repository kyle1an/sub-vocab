import * as Sentry from '@sentry/react'
import { inject } from '@vercel/analytics'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './app.tsx'

if (import.meta.env.PROD) {
  inject()
  Sentry.init({
    dsn: 'https://c85c12d1ecc241558e8aa3bc55dea61f@o4505257329098752.ingest.sentry.io/4505257332178944',
    integrations: [
      Sentry.browserTracingIntegration({
        // See docs for support of different versions of variation of react router
        // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
        // routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        //   React.useEffect,
        //   useLocation,
        //   useNavigationType,
        //   createRoutesFromChildren,
        //   matchRoutes
        // ),
      }),
      Sentry.replayIntegration(),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    tracesSampleRate: 0, // Capture 100% of the transactions, reduce in production!

    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: [/^https:\/\/subvocab/],

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
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
