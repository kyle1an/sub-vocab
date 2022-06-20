import { fetchPost  } from './request';

export async function login(info: { username: string, password: string }) {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/login`, {
    body: JSON.stringify(info),
  })
}
