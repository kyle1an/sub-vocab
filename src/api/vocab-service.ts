import { wrapCookie } from '../utils/cookie'
import { Sieve, Stems, userVocab } from '../types'
import { fetchPost } from './request'

export async function queryWordsByUser(user: string): Promise<Sieve[]> {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/queryWords`, {
    body: JSON.stringify(wrapCookie({ user })),
  })
}

export async function stemsMapping(): Promise<Stems[]> {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/stemsMapping`)
}

export async function acquaint(newWordInfo: userVocab) {
  if (newWordInfo.word.length > 32) return
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/acquaint`, {
    body: JSON.stringify(wrapCookie(newWordInfo)),
  })
}

export async function revokeWord(vocabInfo: userVocab) {
  if (vocabInfo.word.length > 32) return
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/revokeWord`, {
    body: JSON.stringify(wrapCookie(vocabInfo)),
  })
}
