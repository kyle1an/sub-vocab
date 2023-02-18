import { get } from 'lodash-es'
import type { MyVocabRow, Order } from '@/types'

export function sortByChar(a: string, b: string) {
  return a.localeCompare(b, 'en', { sensitivity: 'base' })
}

export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

export function selectWord(e: Event) {
  window.getSelection()?.selectAllChildren(<Node>e.target)
}

export function removeClass(className: string) {
  const el = document.getElementsByClassName(className)
  while (el.length) {
    el[el.length - 1].classList.remove(className)
  }
}

export const jsonClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

export const orderBy = (prop: string | null, order: Order) => {
  return <T extends MyVocabRow>(rows: T[]) => {
    if (!prop || !order) {
      return rows
    }

    const reverse = order === 'ascending' ? 1 : -1
    switch (prop) {
      case 'vocab.rank':
        return rows.sort((obj1, obj2) => reverse * (
          (obj1.vocab.rank ?? Infinity) - (obj2.vocab.rank ?? Infinity)
          || obj1.vocab.w.length - obj2.vocab.w.length
          || obj1.vocab.w.localeCompare(obj2.vocab.w, 'en', { sensitivity: 'base' })
        ))
      case 'vocab.time_modified':
        return rows.sort((obj1, obj2) => reverse * (
          (obj1.vocab.time_modified ?? '').localeCompare(obj2.vocab.time_modified ?? '')
          || obj1.vocab.w.localeCompare(obj2.vocab.w, 'en', { sensitivity: 'base' })
        ))
      case 'vocab.w.length':
        return rows.sort((obj1, obj2) => reverse * (
          obj1.vocab.w.length - obj2.vocab.w.length
          || obj1.vocab.w.localeCompare(obj2.vocab.w, 'en', { sensitivity: 'base' })
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

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const timers: Record<string, boolean> = {}

export function timer(label: string) {
  if (timers[label]) return

  console.time(label)
  timers[label] = true
}

export function timerEnd(label: string) {
  if (!timers[label]) return

  console.timeEnd(label)
  timers[label] = false
}

export const paging = (currPage: number, pageSize: number) => <T>(rows: T[]) => rows.slice((currPage - 1) * pageSize, currPage * pageSize)

export const daysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate()

export const tap = <T>(a: T) => a
