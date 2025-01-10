import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientAtom } from 'jotai-tanstack-query'
import { RouterProvider } from 'react-router/dom'

import '@/i18n'

import './main.css'

import { router } from '@/router'
import { queryClient, trpcClient, TRPCProvider } from '@/store/useVocab'

if (import.meta.env.DEV) {
  import('jotai-devtools/styles.css')
  import('./styles/devtools.css')
}

const HydrateAtoms = ({ children }: React.HTMLAttributes<HTMLElement>) => {
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return children
}

function App() {
  return (
    <TRPCProvider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <HydrateAtoms>
          <RouterProvider router={router} />
        </HydrateAtoms>
      </QueryClientProvider>
    </TRPCProvider>
  )
}

export default App
