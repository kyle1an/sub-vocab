import type { LoginResponse, RegisterResponse, Status, UsernameTaken } from '../../../backend/types'
import { postRequest } from '@/api/request'

export async function login(info: { username: string, password: string }) {
  return postRequest<LoginResponse>(`/api/login`, info)
}

export async function register(info: { username: string, password: string }) {
  return postRequest<RegisterResponse>(`/api/register`, info)
}

export async function changeUsername(info: { username: string, newUsername: string }) {
  return postRequest<Status>(`/api/changeUsername`, info)
}

export async function changePassword(info: { username: string, oldPassword: string, newPassword: string }) {
  return postRequest<Status>(`/api/changePassword`, info)
}

export async function logoutToken(info: { username: string }) {
  return postRequest<Status>(`/api/logoutToken`, info)
}

export async function isUsernameTaken(info: { username: string }) {
  return postRequest<UsernameTaken>(`/api/existsUsername`, info)
}
