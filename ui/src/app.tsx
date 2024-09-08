import { QueryClientProvider } from '@tanstack/react-query'
import { ComposeContextProvider } from 'foxact/compose-context-provider'
import { RouterProvider } from 'react-router-dom'

import './i18n'
import './main.css'
import { router } from './router'
import { queryClient } from './store/useVocab'

/* eslint-disable react/no-missing-key */
const contexts = [
  <QueryClientProvider client={queryClient} />,
  <RouterProvider router={router} />,
]
/* eslint-enable react/no-missing-key */

function App() {
  return (
    <ComposeContextProvider contexts={contexts}>
    </ComposeContextProvider>
  )
}

export default App
