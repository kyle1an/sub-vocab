import { postRequest } from '@/api/request'
import { wrapCookie } from '@/utils/cookie'

export async function login(info: { username: string, password: string }) {
  return postRequest(`${import.meta.env.VITE_SUB_PROD}/login`, info)
}

export async function register(info: { username: string, password: string }) {
  return postRequest(`${import.meta.env.VITE_SUB_PROD}/register`, info)
}

export async function changeUsername(info: { username: string, newUsername: string }) {
  return postRequest(`${import.meta.env.VITE_SUB_PROD}/changeUsername`, wrapCookie(info))
}

export async function changePassword(info: { username: string, oldPassword: string, newPassword: string }) {
  return postRequest(`${import.meta.env.VITE_SUB_PROD}/changePassword`, wrapCookie(info))
}

export async function logoutToken(info: { username: string }) {
  return postRequest(`${import.meta.env.VITE_SUB_PROD}/logoutToken`, wrapCookie(info))
}

export async function isUsernameTaken(info: { username: string }) {
  return postRequest(`${import.meta.env.VITE_SUB_PROD}/existsUsername`, info)
}
