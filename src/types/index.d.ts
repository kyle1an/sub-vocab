export interface Segment {
  id: number,
  title: string,
  default?: boolean
}

export interface Vocab {
  w: string;
}

export interface Sieve {
  w: string,
  is_valid: number | boolean,
  is_user: number | boolean,
  id?: number,
}

export interface Label extends Vocab {
  w: string;
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
}

export type TrieNode = Record<any, Record<any, any | Label>>;

export type Source = Array<Array<any>>;

export type TrieNodes = { [key: string]: TrieNode; [key: $]: Label; [key: vocab]: Sieve };
