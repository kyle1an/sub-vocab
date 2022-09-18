import { wrapCookie } from '@/utils/cookie'
import type { Stems, UserVocab, userVocab } from '@/types'
import { postRequest } from '@/api/request'

export async function queryWordsByUser(user: string): Promise<UserVocab[]> {
  return postRequest(`${import.meta.env.VITE_SUB_PROD}/api/queryWords`, wrapCookie({ user }))
}

export async function stemsMapping(): Promise<Stems[]> {
  return postRequest(`${import.meta.env.VITE_SUB_PROD}/api/stemsMapping`)
}

export async function acquaint(newWordInfo: userVocab) {
  if (newWordInfo.word.length > 32) return
  return postRequest(`${import.meta.env.VITE_SUB_PROD}/api/acquaint`, wrapCookie(newWordInfo))
}

export async function revokeWord(vocabInfo: userVocab) {
  if (vocabInfo.word.length > 32) return
  return postRequest(`${import.meta.env.VITE_SUB_PROD}/api/revokeWord`, wrapCookie(vocabInfo))
}
