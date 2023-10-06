import type { RegisterResponse, Status, UsernameTaken } from '../types/shared.ts'
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

export async function register(info: Credential) {
  return postRequest<RegisterResponse>(`/api/register`, info)
}

export async function changeUsername(info: NewUsername) {
  return postRequest<Status>(`/api/changeUsername`, info)
}

export async function changePassword(info: NewCredential) {
  return postRequest<Status>(`/api/changePassword`, info)
}

export async function logoutToken(info: Username) {
  return postRequest<Status>(`/api/logoutToken`, info)
}

export async function isUsernameTaken(info: Username) {
  return postRequest<UsernameTaken>(`/api/existsUsername`, info)
}
