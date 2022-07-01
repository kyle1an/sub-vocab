import { fetchPost } from './request';
import { wrapCookie } from '../utils/cookie';

export async function queryWordsByUser(user: string) {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/queryWords`, {
    body: JSON.stringify(wrapCookie({ user })),
  })
}

export async function stemsMapping() {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/stemsMapping`)
}

export async function acquaint(newWordInfo: any) {
  if (newWordInfo.word.length > 32) return;
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/acquaint`, {
    body: JSON.stringify(wrapCookie(newWordInfo)),
  })
}

export async function revokeWord(vocabInfo: any) {
  if (vocabInfo.word.length > 32) return;
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/revokeWord`, {
    body: JSON.stringify(wrapCookie(vocabInfo)),
  })
}
