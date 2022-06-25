import { fetchPost } from './request';

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
