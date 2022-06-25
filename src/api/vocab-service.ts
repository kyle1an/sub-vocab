import { fetchPost } from './request';

export async function queryWordsByUser(user: string, token?: any) {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/queryWords`, {
    body: JSON.stringify({ user, token }),
  })
}

export async function acquainted(newWordInfo: any) {
  if (newWordInfo.word.length > 32) return;
  console.log('newWordInfo', newWordInfo);
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/acquaint`, {
    body: JSON.stringify(newWordInfo),
  })
}

export async function revokeWord(vocabInfo: any) {
  if (vocabInfo.word.length > 32) return;
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/revokeWord`, {
    body: JSON.stringify(vocabInfo),
  })
}
