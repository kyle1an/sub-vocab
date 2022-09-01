export interface Sieve extends Record<string, unknown> {
  w: string;
  acquainted: number | boolean,
  is_user: number | boolean,
  rank?: number | null,
  time_modified?: string | null,
  invalid?: boolean,
}

export interface Stems {
  derivations: string,
  stem_word: string,
}

export interface LabelPre extends Record<string, unknown> {
  w: string;
  src: Source;
  up: boolean;
  vocab: Sieve;
}

export interface Label extends Record<string, unknown> {
  w: string;
  src: Source;
  up: boolean;
  vocab?: Sieve;
  derive?: Label[];
  variant?: boolean;
}

export interface LabelRow extends Record<string, unknown> {
  src: Source;
  vocab: Sieve;
}

export type Source = number[][];
export type Order = 'ascending' | 'descending' | null;

export interface Sorting<T> {
  order: Order;
  prop: keyof T | null;
}

export interface userVocab {
  user: string;
  word: string;
}

export type Char = `'` | '’' | '-' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';

export interface TrieNode<T> {
  $?: T;
  "'"?: TrieNode<T>;
  '’'?: TrieNode<T>;
  '-'?: TrieNode<T>;
  a?: TrieNode<T>;
  b?: TrieNode<T>;
  c?: TrieNode<T>;
  d?: TrieNode<T>;
  e?: TrieNode<T>;
  f?: TrieNode<T>;
  g?: TrieNode<T>;
  h?: TrieNode<T>;
  i?: TrieNode<T>;
  j?: TrieNode<T>;
  k?: TrieNode<T>;
  l?: TrieNode<T>;
  m?: TrieNode<T>;
  n?: TrieNode<T>;
  o?: TrieNode<T>;
  p?: TrieNode<T>;
  q?: TrieNode<T>;
  r?: TrieNode<T>;
  s?: TrieNode<T>;
  t?: TrieNode<T>;
  u?: TrieNode<T>;
  v?: TrieNode<T>;
  w?: TrieNode<T>;
  x?: TrieNode<T>;
  y?: TrieNode<T>;
  z?: TrieNode<T>;
}
