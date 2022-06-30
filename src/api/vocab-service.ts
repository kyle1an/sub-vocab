import { fetchPost } from './request';
import { acct } from '../utils/cookie';

export async function queryWordsByUser(user: string, token?: any) {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/queryWords`, {
    body: JSON.stringify({ acct, user, token }),
  })
}

export async function stemsMapping() {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/stemsMapping`)
}

export async function acquaint(newWordInfo: any) {
  if (newWordInfo.word.length > 32) return;
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/acquaint`, {
    body: JSON.stringify({ acct, ...newWordInfo }),
  })
}

export async function revokeWord(vocabInfo: any) {
  if (vocabInfo.word.length > 32) return;
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/revokeWord`, {
    body: JSON.stringify({ acct, ...vocabInfo }),
  })
}
