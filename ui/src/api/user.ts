import { useMutation } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import type {
  LoginResponse, RegisterResponse, Status, UsernameTaken,
} from '../types/shared.ts'
import { setUsername } from '@/store/useVocab'
import { postRequest } from '@/lib/request'

export interface Username {
  username: string
}

export interface Credential extends Username {
  password: string
}

export interface NewUsername extends Username {
  newUsername: string
}

export interface NewCredential extends Username {
  oldPassword: string
  newPassword: string
}

export function useRegister() {
  return useMutation({
    mutationKey: ['SignIn'],
    mutationFn: function register(info: Credential) {
      return postRequest<RegisterResponse>(`/api/register`, info)
    },
  })
}

export function useChangeUsername() {
  return useMutation({
    mutationKey: ['ChangeUsername'],
    mutationFn: function changeUsername(info: NewUsername) {
      return postRequest<Status>(`/api/changeUsername`, info)
    },
    onSuccess: (res, variables, context) => {
      if (res.success) {
        setUsername(variables.newUsername)
      }
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationKey: ['ChangePassword'],
    mutationFn: function changePassword(info: NewCredential) {
      return postRequest<Status>(`/api/changePassword`, info)
    },
  })
}

export function useLogOut() {
  return useMutation({
    mutationKey: ['LogOut'],
    mutationFn: function logoutToken(info: Username) {
      return postRequest<Status>(`/api/logoutToken`, info)
    },
    onSuccess: (resAuth, variables, context) => {
      Cookies.remove('_user', { path: '' })
      Cookies.remove('acct', { path: '' })
      setUsername('')
    },
  })
}

export function useIsUsernameTaken() {
  return useMutation({
    mutationKey: ['isUsernameTaken'],
    mutationFn: function isUsernameTaken(info: Username) {
      return postRequest<UsernameTaken>(`/api/existsUsername`, info)
    },
  })
}

export function useSignIn() {
  return useMutation({
    mutationKey: ['SignIn'],
    mutationFn: (credential: Credential) => postRequest<LoginResponse>(`/api/login`, credential),
    onSuccess: (resAuth, variables, context) => {
      if (resAuth[0]) {
        setUsername(variables.username)
      }
    },
  })
}
