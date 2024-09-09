import type { AppRouter } from '@subvocab/backend/app'
import type { SignInWithPasswordCredentials, SignUpWithPasswordCredentials, UserAttributes } from '@supabase/supabase-js'
import type { inferRouterClient } from '@trpc/client'

import { useMutation } from '@tanstack/react-query'

import { supabase, trpc } from '@/store/useVocab'

export function useRegister() {
  return useMutation({
    mutationKey: ['signUp'],
    mutationFn: function signUp(credentials: SignUpWithPasswordCredentials) {
      return supabase.auth.signUp(credentials)
    },
  })
}

export function useUpdateUser() {
  return useMutation({
    mutationKey: ['updateUser', 'username'],
    mutationFn: async function updateUser(attributes: UserAttributes) {
      return supabase.auth.updateUser(attributes)
    },
  })
}

export function useUpdateEmail() {
  return useMutation({
    mutationKey: ['updateUser', 'email'],
    mutationFn: async function updateUser(attributes: UserAttributes) {
      return supabase.auth.updateUser(attributes)
    },
  })
}

export function useLogOut() {
  return useMutation({
    mutationKey: ['signOut'],
    mutationFn: function signOut() {
      return supabase.auth.signOut({ scope: 'local' })
    },
  })
}

export function useSignIn() {
  return useMutation({
    mutationKey: ['signInWithPassword'],
    mutationFn: function signInWithPassword(credentials: SignInWithPasswordCredentials) {
      return supabase.auth.signInWithPassword(credentials)
    },
  })
}

type SignInResponse = Awaited<ReturnType<inferRouterClient<AppRouter>['user']['signIn']['mutate']>>

export function useSignInWithUsername() {
  const { mutateAsync } = useMutation({
    mutationKey: ['setSession'],
    mutationFn: async function setSession(result: SignInResponse) {
      if (!result) throw new Error('No session')
      const { session } = result.data
      if (session) {
        return await supabase.auth.setSession(session)
      }
      return result.data
    },
  })

  // https://stackoverflow.com/a/74898111/10903455
  return trpc.user.signIn.useMutation({
    mutationKey: ['signInWithUsername'],
    onSuccess: (credential) => {
      return mutateAsync(credential)
    },
    retry: 2,
  })
}
