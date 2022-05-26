export interface Segment {
  id: number,
  title: string,
  default?: boolean
}

export interface Vocab {
  w: string;
}

export interface Sieve extends Vocab {
  id?: number,
  w: string,
  is_valid: number | boolean,
  is_user: number | boolean,
}

export interface Label extends Vocab {
  freq: number;
  len: number;
  up?: boolean;
  seq?: number;
  src: Source;
  F?: boolean;
  vocab?: Sieve;
}

export interface Trie {
  root: TrieNode;

  add(word: string): this;

  #insert(word: string): void;
}

export type TrieNode = Record<any, Record<any, any | Label>>;

export type Source = Array<Array<any>>;
