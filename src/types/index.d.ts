export interface Segment {
  id: number,
  title: string,
  default?: boolean
}

export interface Vocab {
  w: string;
}

export interface Occur extends Label {
  freq?: number,
  src: Source;
  seq: number;
}

export interface Sieve {
  w: string,
  is_valid: number | boolean,
  is_user: number | boolean,
  id?: number,
}

export interface Label extends Vocab {
  w: string;
  up?: boolean;
  len?: number;
  freq?: number;
  src: Source;
  seq?: number;
  F?: boolean | number;
  vocab?: Sieve;
}

export interface Trie {
  root: TrieNodeMap;

  add(word: string): this;
}

export type Source = Array<[number, number, number, number]>;

type Char = "'" | '-' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';

export type TrieNodeMap = Map<Char, TrieNodeMap> & Map<'$', Label>;
