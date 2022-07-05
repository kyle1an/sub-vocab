import { Char, TrieNode } from "../types";

export function sortByChar(a: string, b: string): number {
  return a.localeCompare(b, 'en', { sensitivity: 'base' });
}

export function sortByNum(a: any, b: any): number {
  if (a === null) return 1
  if (b === null) return -1
  return a - b;
}

const print = (m: any, space = 0) => console.log(JSON.stringify(m, null, space).replace(/"/mg, ""))
const stringify = (m: any, space = 0) => ({ s: JSON.stringify(m, null).replace(/"/mg, "'") })

export function getNode(node: TrieNode, word: string) {
  for (const c of word.split('')) {
    node = node[(c as Char)] ??= {};
  }

  return node;
}

function mergeSorted(a: any, b: any): any {
  if (!a.length) {
    return b;
  } else if (!b.length) {
    return a;
  }

  const merged = [];
  let i = 0;
  let j = 0;
  const lenA = a.length;
  const lenB = b.length;

  while (i < lenA && j < lenB) {
    const ai0 = a[i][0];
    const bj0 = b[j][0];
    merged.push(
      ai0 < bj0 ? a[i++]
        : ai0 > bj0 ? b[j++]
          : [ai0, mergeSorted(a[i++][1], b[j++][1])]
    );
  }

  return merged.concat(a.slice(i)).concat(b.slice(j));
}

export function caseOr(a: string, b: string): string {
  const r = [];

  for (let i = 0; i < a.length; i++) {
    r.push(a.charCodeAt(i) | b.charCodeAt(i));
  }

  return String.fromCharCode(...r);
}

export function selectWord(e: any) {
  window.getSelection()?.selectAllChildren(e.target)
}

export function removeClass(className: string) {
  const el = document.getElementsByClassName(className)
  while (el.length) {
    el[el.length - 1].classList.remove(className)
    console.log(1)
  }
}

export function readSingleFile(file: any): any {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      const { result } = fr
      resolve({ file, result })
    }
    fr.onerror = reject;
    fr.readAsText(file)
  })
}

export async function readFiles(files: any): Promise<any[]> {
  const fileList = []
  for (let i = 0; i < files.length; i++) {
    fileList.push(await readSingleFile(files[i]))
  }

  return fileList
}

export const jsonClone = (obj: any) => JSON.parse(JSON.stringify(obj))

export const classKeyOfRow = (seq: string | number) => `v-${seq}`

export function compare(propertyName: string, order: string) {
  return function (obj1: any, obj2: any): number {
    const value1 = obj1[propertyName];
    const value2 = obj2[propertyName];
    let res;
    if (typeof value1 === 'string' && typeof value2 === 'string') {
      res = sortByChar(value1, value2)
    } else {
      res = sortByNum(value1, value2)
    }
    return order === 'ascending' ? res : -res
  }
}
