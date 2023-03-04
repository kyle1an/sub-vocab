import '@total-typescript/ts-reset'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicAttributes {
      'class'?: string
    }
  }
}
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {}

export type Order = 'ascending' | 'descending' | null;

export interface Sorting {
  order: Order;
  prop: string | null;
}

export interface UserVocab {
  user: string;
  word: string;
}

export interface UserVocabs {
  user: string;
  words: string[];
}

export * from './vocab'