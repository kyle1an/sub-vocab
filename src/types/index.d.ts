export interface Vocab {
  w: string;
}

export interface Sieve extends Vocab {
  acquainted: number | boolean,
  is_user: number | boolean,
  id?: number,
}

export interface Label extends Vocab {
  src: Source;
  up?: boolean;
  len?: number;
  freq?: number;
  seq?: number;
  F?: boolean | number;
  vocab?: Sieve;
}

export interface Occur extends Label {
  src: Source;
  seq: number;
  freq?: number,
}

export interface Trie {
  root: TrieNode;

  add(word: string): this;
}

export type Source = Array<[number, number, number, number]>;

export type Char = '\'' | '-' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';

export type TrieNodeMap = Map<Char, TrieNodeMap> & Map<'$', Label>;

export interface TrieNode {
  $?: Label;
  '\''?: TrieNode;
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
