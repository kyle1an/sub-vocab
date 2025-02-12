import type { AppRouter } from '@backend/app'

import { CssVarsProvider } from '@mui/joy/styles'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'

import '@/i18n'

import './main.css'
import './styles/squircle.css'

import { queryClientAtom } from 'jotai-tanstack-query'
import { RouterProvider } from 'react-router/dom'

import { TRPCProvider } from '@/api/trpc'
import { env } from '@/env'
import { omitUndefined } from '@/lib/utilities'
import { router } from '@/router'
import { queryClient } from '@/store/useVocab'

if (import.meta.env.DEV) {
  import('jotai-devtools/styles.css')
  import('./styles/devtools.css')
}

const HydrateAtoms = ({ children }: React.HTMLAttributes<HTMLElement>) => {
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return children
}

function App() {
  const baseUrl = env.VITE_SUB_API_URL
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${baseUrl}/trpc`,
          fetch(url, options) {
            return fetch(url, omitUndefined({
              ...options,
              credentials: 'include',
            }))
          },
        }),
      ],
    }),
  )
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <HydrateAtoms>
          <CssVarsProvider>
            <RouterProvider router={router} />
          </CssVarsProvider>
        </HydrateAtoms>
      </TRPCProvider>
    </QueryClientProvider>
  )
}

export default App
