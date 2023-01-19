import { postRequest } from '@/api/request'

export async function login(info: { username: string, password: string }) {
  return postRequest<[boolean] | []>(`/api/login`, info)
}

export async function register(info: { username: string, password: string }) {
  return postRequest(`/api/register`, info)
}

export async function changeUsername(info: { username: string, newUsername: string }) {
  return postRequest<{ success: boolean }>(`/api/changeUsername`, info)
}

export async function changePassword(info: { username: string, oldPassword: string, newPassword: string }) {
  return postRequest<{ success: boolean }>(`/api/changePassword`, info)
}

export async function logoutToken(info: { username: string }) {
  return postRequest<{ success: boolean }>(`/api/logoutToken`, info)
}

export async function isUsernameTaken(info: { username: string }) {
  return postRequest<{ has: boolean }>(`/api/existsUsername`, info)
}
