import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ComposeContextProvider } from 'foxact/compose-context-provider'
import { router } from './router'
import './main.css'
import './i18n'
import { queryClient } from './lib/utils'

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
