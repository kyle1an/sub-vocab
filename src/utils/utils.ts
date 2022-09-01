import { Order } from '@/types'

export function sortByChar(a: string, b: string): number {
  return a.localeCompare(b, 'en', { sensitivity: 'base' })
}

export function sortByDateISO(a: string, b: string): number {
  return (a < b) ? -1 : ((a > b) ? 1 : 0)
}

export function sortNum1st(a: unknown, b: unknown): number {
  if (typeof a === 'number') {
    if (typeof b === 'number') {
      return a - b
    }

    return -1
  }

  if (typeof b === 'number') {
    return 1
  }

  return 0
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

export function compare(propName: string | number, order: Order) {
  return (obj1: Record<string, unknown>, obj2: Record<string, unknown>): number => {
    let o1 = obj1[propName]
    let o2 = obj2[propName]

    if (typeof propName === 'string' && propName.includes('.')) {
      const path = propName.split('.')
      o1 = path.reduce((o, prop) => o[prop] as Record<string, unknown>, obj1)
      o2 = path.reduce((o, prop) => o[prop] as Record<string, unknown>, obj2)
    }

    return (order === 'ascending' ? 1 : -1) * sort(o1, o2)

    function sort(a: unknown, b: unknown) {
      if (typeof a === 'string' && typeof b === 'string') {
        return sortByChar(a, b)
      }

      return sortNum1st(a, b)
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

export function promiseClone<T>(trie: T): Promise<T> {
  return new Promise((resolve) => {
    resolve(structuredClone(trie))
  })
}

export const useRange = (currPage: number, pageSize: number) => [(currPage - 1) * pageSize, currPage * pageSize]
