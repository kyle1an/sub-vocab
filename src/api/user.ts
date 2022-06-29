import { fetchPost } from './request';
import { acct } from '../utils/cookie';

export async function login(info: { username: string, password: string }) {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/login`, {
    body: JSON.stringify(info),
  })
}

export async function register(info: { username: string, password: string }) {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/register`, {
    body: JSON.stringify(info),
  })
}

export async function changeUsername(info: { username: string, newUsername: string }) {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/changeUsername`, {
    body: JSON.stringify({ acct, ...info }),
  })
}

export async function changePassword(info: { username: string, oldPassword: string, newPassword: string }) {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/changePassword`, {
    body: JSON.stringify({ acct, ...info }),
  })
}

export async function logoutToken(info: { username: string }) {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/logoutToken`, {
    body: JSON.stringify({ acct, ...info }),
  })
}
