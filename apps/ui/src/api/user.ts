import type { TRPCClient } from '@trpc/client'

import { useMutation } from '@tanstack/react-query'

import type { AppRouter } from '@backend/app'

import { useTRPC } from '@/api/trpc'
import { supabaseAuth } from '@/store/useVocab'

type SignInResponse = Awaited<ReturnType<TRPCClient<AppRouter>['user']['signIn']['mutate']>>

export function useSignInWithUsername() {
  const { mutateAsync } = useMutation({
    mutationKey: ['setSession'],
    mutationFn: async (result: SignInResponse) => {
      const session = result.data?.session
      if (session) {
        await supabaseAuth.setSession(session)
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
