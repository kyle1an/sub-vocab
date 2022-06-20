import { fetchPost } from './request';

export async function queryWords() {
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/queryWords`,)
}

export async function acquainted(newWord: { word: string }) {
  if (newWord.word.length > 32) return;
  console.log('newWord', newWord);
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/acquaint`, {
    body: JSON.stringify(newWord),
  })
}

export async function revokeWord(vocab: { word: string }) {
  if (vocab.word.length > 32) return;
  return fetchPost(`${import.meta.env.VITE_SUB_PROD}/api/revokeWord`, {
    body: JSON.stringify(vocab),
  })
}
