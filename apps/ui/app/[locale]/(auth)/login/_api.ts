import type { TRPCClient } from '@trpc/client'

import { useMutation } from '@tanstack/react-query'

import type { AppRouter } from '@/trpc/routers/_app'

import { createClient } from '@/lib/supabase/client'
import { useTRPC } from '@/trpc/client.var'

type SignInResponse = Awaited<ReturnType<TRPCClient<AppRouter>['user']['signIn']['mutate']>>

export function useSignInWithUsername() {
  const { mutateAsync } = useMutation({
    mutationKey: ['setSession'],
    mutationFn: async (result: SignInResponse) => {
      const supabase = createClient()
      const session = result.data?.session
      if (session) {
        await supabase.auth.setSession(session)
      }
      return result
    },
  })

  const trpc = useTRPC()
  // https://stackoverflow.com/a/74898111/10903455
  return useMutation(trpc.user.signIn.mutationOptions({
    onSuccess: (credential) => mutateAsync(credential),
    retry: 2,
  }))
}
