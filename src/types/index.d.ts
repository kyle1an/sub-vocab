export interface Segment {
  id: number,
  title: string,
  default?: boolean
}

export interface Vocab {
  len: number;
  w: string;
}

export interface Label extends Vocab {
  F?: boolean;
  freq: number;
  W?: string;
  seq: number;
  src: Array<any>;
}

export interface Trie {
  root: TrieNode;

  add(word: string): void;

  #insert(word: string): void;
}
