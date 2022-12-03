import { get } from 'lodash-es'
import type { Order } from '@/types'
import { MyVocabRow } from '@/types'

export function sortByChar(a: string, b: string): number {
  return a.localeCompare(b, 'en', { sensitivity: 'base' })
}

export function caseOr(a: string, b: string): string {
  const r = []

  for (let i = 0; i < a.length; i++) {
    r.push(a.charCodeAt(i) | b.charCodeAt(i))
  }

  return String.fromCharCode(...r)
}

export const hasUppercase = (chars: string) => /[A-ZÀ-Þ]/.test(chars)

export const isVowel = (chars: string) => ['a', 'e', 'i', 'o', 'u'].includes(chars)

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

type fileResult = { result: FileReader['result'] }

export function readSingleFile(file: File): Promise<fileResult> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      const { result } = fr
      resolve({ result })
    }
    fr.onerror = reject
    fr.readAsText(file)
  })
}

export async function readFiles(files: FileList) {
  const fileList: fileResult[] = []
  for (let i = 0; i < files.length; i++) {
    fileList.push(await readSingleFile(files[i]))
  }

  return fileList
}

export const jsonClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

type RecordUnknown = Record<string, unknown>

export const orderBy = (prop: string | number | null, order: Order) => <T extends MyVocabRow>(rows: T[]) => prop && order ? rows.sort(compareFn(prop, order)) : rows

export function compareFn(propName: string | number, order: NonNullable<Order>): (obj1: MyVocabRow, obj2: MyVocabRow) => number {
  const reverse = order === 'ascending' ? 1 : -1
  switch (propName) {
    case 'vocab.rank':
      return (obj1, obj2) => reverse * (
        (obj1.vocab.rank ?? Infinity) - (obj2.vocab.rank ?? Infinity)
        || obj1.vocab.w.length - obj2.vocab.w.length
        || obj1.vocab.w.localeCompare(obj2.vocab.w, 'en', { sensitivity: 'base' })
      )
    case 'vocab.time_modified':
      return (obj1, obj2) => reverse * (
        (obj1.vocab.time_modified ?? '').localeCompare(obj2.vocab.time_modified ?? '')
        || obj1.vocab.w.localeCompare(obj2.vocab.w, 'en', { sensitivity: 'base' })
      )
    case 'vocab.w.length':
      return (obj1, obj2) => reverse * (
        obj1.vocab.w.length - obj2.vocab.w.length
        || obj1.vocab.w.localeCompare(obj2.vocab.w, 'en', { sensitivity: 'base' })
      )
    default:
      return (obj1, obj2) => {
        const a = get(obj1, propName)
        const b = get(obj2, propName)
        if (typeof a === 'number' && typeof b === 'number') {
          return reverse * (a - b)
        }
        return reverse * String(a).localeCompare(String(b), 'en', { sensitivity: 'base' })
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

export const skip = <T>(a: T) => a

export function resetFileInput(selectors: string) {
  const input = document.querySelectorAll(selectors) as NodeListOf<HTMLInputElement>
  for (let i = 0; i < input.length; i++) {
    input[i].value = ''
  }
}
