import { Char, TrieNode } from '../types'

export function sortByChar(a: string, b: string): number {
  return a.localeCompare(b, 'en', { sensitivity: 'base' })
}

export function sortByNum(a: number, b: number): number {
  if (a === null) return 1
  if (b === null) return -1
  return a - b
}

export function getNode(node: TrieNode, word: string) {
  for (const c of word.split('')) {
    node = node[(c as Char)] ??= {}
  }

  return node
}

export function caseOr(a: string, b: string): string {
  const r = []

  for (let i = 0; i < a.length; i++) {
    r.push(a.charCodeAt(i) | b.charCodeAt(i))
  }

  return String.fromCharCode(...r)
}

export function selectWord(e: Event) {
  window.getSelection()?.selectAllChildren(<Node>e.target)
}

export function removeClass(className: string) {
  const el = document.getElementsByClassName(className)
  while (el.length) {
    el[el.length - 1].classList.remove(className)
  }
}

export function readSingleFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      const { result } = fr
      resolve({ file, result })
    }
    fr.onerror = reject
    fr.readAsText(file)
  })
}

export async function readFiles(files: FileList): Promise<any[]> {
  const fileList = []
  for (let i = 0; i < files.length; i++) {
    fileList.push(await readSingleFile(files[i]))
  }

  return fileList
}

export const jsonClone = (obj: object) => JSON.parse(JSON.stringify(obj))

export const classKeyOfRow = (seq: string | number) => `v-${seq}`

export function compare(propertyName: string, order: string) {
  return function (obj1: any, obj2: any): number {
    const value1 = obj1[propertyName]
    const value2 = obj2[propertyName]
    let res

    if (typeof value1 === 'string' && typeof value2 === 'string') {
      res = sortByChar(value1, value2)
    } else {
      res = sortByNum(value1, value2)
    }

    return order === 'ascending' ? res : -res
  }
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
