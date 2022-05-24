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
  up?: boolean | undefined;
  seq?: number;
  src: Array<any>;
  F?: boolean;
  vocab?: any;
}

export interface Trie {
  root: TrieNode;

  add(word: string): void;

  #insert(word: string): void;
}
