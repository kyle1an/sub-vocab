import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { VueQueryPlugin } from '@tanstack/vue-query'
import * as Sentry from '@sentry/vue'
import RootLayout from './app/layout'
import '@/main.css'
import 'element-plus/dist/index.css'
import router from '@/router'

const app = createApp(<RootLayout />)
Sentry.init({
  app,
  dsn: 'https://c85c12d1ecc241558e8aa3bc55dea61f@o4505257329098752.ingest.sentry.io/4505257332178944',
  integrations: [
    new Sentry.BrowserTracing({
      // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ['localhost', /^https:\/\/subvocab/],
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})
app.use(VueQueryPlugin)
app.use(createPinia()
  .use(createPersistedState({
    storage: sessionStorage,
  })))
app.use(router)
app.mount('#app')
