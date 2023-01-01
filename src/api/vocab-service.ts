import type { UserVocab, VocabFromUser } from '@/types'
import { postRequest } from '@/api/request'

export async function queryWordsByUser(user: string): Promise<VocabFromUser[]> {
  return postRequest(`/api/api/queryWords`, { user }, { timeout: 4000 })
}

export async function stemsMapping(): Promise<string[][]> {
  return postRequest(`/api/api/stemsMapping`, {}, { timeout: 2000 })
}

export async function acquaint(newWordInfo: UserVocab) {
  if (newWordInfo.word.length > 32) return
  return postRequest(`/api/api/acquaint`, newWordInfo)
}

export async function batchAcquaint(wordsInfo: { words: string[]; user: string }) {
  return postRequest(`/api/api/acquaintWords`, wordsInfo)
}

export async function revokeWord(vocabInfo: UserVocab) {
  if (vocabInfo.word.length > 32) return
  return postRequest(`/api/api/revokeWord`, vocabInfo)
}
