import { get } from 'lodash-es'
import type { TableColumnInstance } from 'element-plus'
import { type VocabState } from '@/store/useVocab'

export function sortByChar(a: string, b: string) {
  return a.localeCompare(b, 'en', { sensitivity: 'base' })
}

export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

export function selectWord(e: Event) {
  window.getSelection()?.selectAllChildren(<Node>e.target)
}

export const orderBy = (prop: string | null, order: NonNullable<TableColumnInstance['sortOrders']>[number]) => {
  return <T extends {
    vocab: VocabState
  }>(rows: T[]) => {
    if (!prop || !order) {
      return rows
    }

    const reverse = order === 'ascending' ? 1 : -1
    switch (prop) {
      case 'vocab.rank':
        return rows.sort((obj1, obj2) => reverse * (
          (obj1.vocab.rank ?? Infinity) - (obj2.vocab.rank ?? Infinity)
          || obj1.vocab.word.length - obj2.vocab.word.length
          || obj1.vocab.word.localeCompare(obj2.vocab.word, 'en', { sensitivity: 'base' })
        ))
      case 'vocab.time_modified':
        return rows.sort((obj1, obj2) => reverse * (
          (obj1.vocab.time_modified ?? '').localeCompare(obj2.vocab.time_modified ?? '')
          || obj1.vocab.word.localeCompare(obj2.vocab.word, 'en', { sensitivity: 'base' })
        ))
      case 'vocab.w.length':
        return rows.sort((obj1, obj2) => reverse * (
          obj1.vocab.word.length - obj2.vocab.word.length
          || obj1.vocab.word.localeCompare(obj2.vocab.word, 'en', { sensitivity: 'base' })
        ))
      default:
        return rows.sort((obj1, obj2) => {
          const a = get(obj1, prop)
          const b = get(obj2, prop)
          if (typeof a === 'number' && typeof b === 'number') {
            return reverse * (a - b)
          }
          return reverse * String(a).localeCompare(String(b), 'en', { sensitivity: 'base' })
        })
    }
  }
}

export const paging = (currPage: number, pageSize: number) => <T>(rows: T[]) => rows.slice((currPage - 1) * pageSize, currPage * pageSize)
