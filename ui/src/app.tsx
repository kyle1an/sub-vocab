import { QueryClientProvider } from '@tanstack/react-query'
import { ComposeContextProvider } from 'foxact/compose-context-provider'
import { queryClientAtom } from 'jotai-tanstack-query'
import { RouterProvider } from 'react-router/dom'

import './i18n'
import './main.css'
import { router } from './router'
import { queryClient, trpc, trpcClient } from './store/useVocab'

if (import.meta.env.DEV) {
  import('jotai-devtools/styles.css')
}

const HydrateAtoms = ({ children }: React.HTMLAttributes<HTMLElement>) => {
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return children
}

/* eslint-disable react/no-missing-key */
const contexts = [
  <trpc.Provider client={trpcClient} queryClient={queryClient}> </trpc.Provider>,
  <QueryClientProvider client={queryClient} />,
  <HydrateAtoms />,
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
