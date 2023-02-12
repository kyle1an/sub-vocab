import type { LabelBase } from '@/types/vocab'

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

export * from './vocab'
