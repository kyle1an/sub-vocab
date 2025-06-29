import type { SignInWithPasswordCredentials, SignUpWithPasswordCredentials, UserAttributes } from '@supabase/supabase-js'
import type { TRPCClient } from '@trpc/client'

import { useMutation } from '@tanstack/react-query'

import type { AppRouter } from '@backend/app'

import { useTRPC } from '@/api/trpc'
import { supabase } from '@/store/useVocab'

export function useRegister() {
  return useMutation({
    mutationKey: ['signUp'],
    mutationFn: (credentials: SignUpWithPasswordCredentials) => {
      return supabase.auth.signUp(credentials)
    },
  })
}

export function useUpdateUser() {
  return useMutation({
    mutationKey: ['updateUser'],
    mutationFn: async (attributes: UserAttributes) => {
      return supabase.auth.updateUser(attributes)
    },
  })
}

export function useUpdateEmail() {
  return useMutation({
    mutationKey: ['useUpdateEmail'],
    mutationFn: async (attributes: UserAttributes) => {
      return supabase.auth.updateUser(attributes)
    },
  })
}

export function useLogOut() {
  return useMutation({
    mutationKey: ['signOut'],
    mutationFn: () => {
      return supabase.auth.signOut({ scope: 'local' })
    },
  })
}

export function useSignInWithEmail() {
  return useMutation({
    mutationKey: ['signInWithPassword'],
    mutationFn: (credentials: SignInWithPasswordCredentials) => {
      return supabase.auth.signInWithPassword(credentials)
    },
  })
}

export function useResetPasswordForEmail() {
  return useMutation({
    mutationKey: ['resetPasswordForEmail'],
    mutationFn: (email: string) => {
      return supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
    },
  })
}

type SignInResponse = Awaited<ReturnType<TRPCClient<AppRouter>['user']['signIn']['mutate']>>

export function useSignInWithUsername() {
  const { mutateAsync } = useMutation({
    mutationKey: ['setSession'],
    mutationFn: async (result: SignInResponse) => {
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
