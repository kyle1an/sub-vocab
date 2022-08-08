export interface Vocab extends Record<string, unknown> {
  w: string;
}

export interface Sieve extends Vocab {
  acquainted: number | boolean,
  is_user: number | boolean,
  id?: number,
}

export interface Stems {
  derivations: string,
  stem_word: string,
}

export interface Label extends Vocab {
  src: Source;
  up?: boolean;
  len?: number;
  freq?: number;
  seq?: number;
  vocab?: Sieve;
}

export interface LabelRow extends Label {
  len: number;
  freq: number;
  seq: number;
}

export interface WordPrime extends Vocab {
  is_user: boolean;
  len: number;
  rank: number;
}

export type Source = Array<[number, number, number, number]>;

export interface Sorting<T> {
  order: 'ascending' | 'descending' | null;
  prop: keyof T | null;
}

export interface userVocab {
  user: string;
  word: string;
}

export type Char = `'` | '-' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';

export interface TrieNode {
  $?: Label;
  "'"?: TrieNode;
  '-'?: TrieNode;
  a?: TrieNode;
  b?: TrieNode;
  c?: TrieNode;
  d?: TrieNode;
  e?: TrieNode;
  f?: TrieNode;
  g?: TrieNode;
  h?: TrieNode;
  i?: TrieNode;
  j?: TrieNode;
  k?: TrieNode;
  l?: TrieNode;
  m?: TrieNode;
  n?: TrieNode;
  o?: TrieNode;
  p?: TrieNode;
  q?: TrieNode;
  r?: TrieNode;
  s?: TrieNode;
  t?: TrieNode;
  u?: TrieNode;
  v?: TrieNode;
  w?: TrieNode;
  x?: TrieNode;
  y?: TrieNode;
  z?: TrieNode;
}
