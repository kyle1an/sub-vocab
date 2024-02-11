import mysql from 'mysql2'
import { type RSH, sql } from '../config/connection'
import type { LabelDB } from '../../ui/src/types/shared'

interface Stems {
  derived_word: string
  stem_word: string
}

export async function getUserWords(user: string) {
  return sql<RSH<LabelDB[]>>`CALL words_from_user(get_user_id_by_name(${user}));`
    .then(([rows]) => {
      return rows[0]
    })
    .catch((err) => {
      throw new Error(err)
    })
}

export async function stemsMapping() {
  return sql<RSH<Stems[]>>`CALL stem_derivation_link();`
    .then(([rows]) => {
      const map: Record<string, string[]> = {}
      rows[0].forEach((link) => {
        map[link.stem_word] ??= [link.stem_word]
        map[link.stem_word].push(link.derived_word)
      })

      return Object.values(map)
    })
    .catch((err) => {
      throw new Error(err)
    })
}

export async function acquaintWords(words: string[], username:string) {
  return Promise.all(words.map((word) => sql<mysql.ResultSetHeader>`CALL acquaint_vocab(${word}, get_user_id_by_name(${username}));`))
    .then(() => {
      return 'success'
    })
    .catch((err) => {
      throw new Error(err)
    })
}

export async function revokeWords(words: string[], username:string) {
  return Promise.all(words.map((word) => sql<mysql.ResultSetHeader>`CALL revoke_vocab_record(${word}, get_user_id_by_name(${username}));`))
    .then(() => {
      return 'success'
    })
    .catch((err) => {
      throw new Error(err)
    })
}
