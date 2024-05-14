import type mysql from 'mysql2'
import { sql } from '../config/connection.js'
import { sql as pg } from '../utils/db.js'
import type { LabelDB } from '../types'

interface Stems {
  derived_word: string
  stem_word: string
}

export async function getUserWords(user: string) {
  const [rows] = await sql<[LabelDB[]]>`CALL words_from_user(get_user_id_by_name(${user}));`
  return rows[0]
}

export async function stemsMapping() {
  return pg<Stems[]>`
  SELECT stem_word, derived_word
  FROM derivation
  ORDER BY stem_word;`
    .then((rows) => {
      const map: Record<string, string[]> = {}
      rows.forEach((link) => {
        let wordGroup = map[link.stem_word]
        if (!wordGroup) {
          wordGroup = [link.stem_word]
          map[link.stem_word] = wordGroup
        }
        wordGroup.push(link.derived_word)
      })

      return Object.values(map)
    })
    .catch(console.error)
}

export async function acquaintWords(words: string[], username: string) {
  return Promise.all(words.map((word) => sql<mysql.ResultSetHeader>`CALL acquaint_vocab(${word}, get_user_id_by_name(${username}));`))
    .then(() => {
      return 'success'
    })
    .catch(console.error)
}

export async function revokeWords(words: string[], username: string) {
  return Promise.all(words.map((word) => sql<mysql.ResultSetHeader>`CALL revoke_vocab_record(${word}, get_user_id_by_name(${username}));`))
    .then(() => {
      return 'success'
    })
    .catch(console.error)
}
