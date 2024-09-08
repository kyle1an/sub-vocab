import type { AuthTokenResponsePassword, SignInWithPasswordCredentials, SignUpWithPasswordCredentials, UserAttributes } from '@supabase/supabase-js'

import { useMutation } from '@tanstack/react-query'

import type { Credential } from '@/shared/api.ts'

import { postRequest } from '@/lib/request'
import { supabase } from '@/store/useVocab'

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
      return supabase.auth.signOut()
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

export function useSignInWithUsername() {
  return useMutation({
    mutationKey: ['signInWithUsername'],
    mutationFn: async (credential: Credential) => {
      const authTokenResponse = await postRequest<AuthTokenResponsePassword>(`/api/sign-in`, credential)
      const { session } = authTokenResponse.data
      if (session) {
        const authResponse = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        })
        return authResponse
      }
      return authTokenResponse
    },
  })
}
