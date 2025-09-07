import { use } from 'react'

import { irregularWordsQueryOptions, sharedVocabularyOptions, userVocabularyOptions } from '@/app/[locale]/(vocabulary)/_api'
import { createClient, supabaseAuthGetUser } from '@/lib/supabase/server'
import { getQueryClient } from '@/trpc/server'
import { HydrateClient } from '@/trpc/server.HydrateClient'

export default function Layout({ children }: LayoutProps<'/[locale]'>) {
  const queryClient = getQueryClient()
  queryClient.prefetchQuery(sharedVocabularyOptions())
  queryClient.prefetchQuery(irregularWordsQueryOptions())
  const { data: { user } } = use(supabaseAuthGetUser())
  if (user?.id) {
    queryClient.prefetchQuery(userVocabularyOptions(user?.id, use(createClient())))
  }
  return (
    <HydrateClient>
      {children}
    </HydrateClient>
  )
}
