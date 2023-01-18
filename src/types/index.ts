import { LabelBase } from '@/types/vocab'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicAttributes {
      'class'?: string
    }
  }
}

export type Order = 'ascending' | 'descending' | null;

export interface Sorting {
  order: Order;
  prop: string | null;
}

export interface UserVocab {
  user: string;
  word: string;
}

export type Char = `'` | '’' | '-' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';

export type TrieNode<T extends LabelBase> = {
  [K in Char | '$']?: K extends Char ? TrieNode<T>
    : K extends '$' ? T
      : never
}

export interface userInfo {
  username: string;
  password: string;
}

export * from './vocab'
