import type { AcquaintWordsResponse, LabelFromUser, StemsMapping, ToggleWordResponse } from '../../../backend/routes/vocab'
import type { UserVocab, UserVocabs } from '@/types'
import { postRequest } from '@/api/request'

export type User = { user: string }

export async function queryWordsByUser(user: string) {
  return postRequest<LabelFromUser[]>(`/api/api/queryWords`, { user } satisfies User, { timeout: 4000 })
}

export async function stemsMapping() {
  return postRequest<StemsMapping>(`/api/api/stemsMapping`, {}, { timeout: 2000 })
}

export async function acquaint(newWordInfo: UserVocab) {
  if (newWordInfo.word.length > 32) return
  return postRequest<ToggleWordResponse>(`/api/api/acquaint`, newWordInfo)
}

export async function batchAcquaint(wordsInfo: UserVocabs) {
  return postRequest<AcquaintWordsResponse>(`/api/api/acquaintWords`, wordsInfo)
}

export async function revokeWord(vocabInfo: UserVocab) {
  if (vocabInfo.word.length > 32) return
  return postRequest<ToggleWordResponse>(`/api/api/revokeWord`, vocabInfo)
}
