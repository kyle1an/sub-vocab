import '@total-typescript/ts-reset'

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {}

export * from './vocab'
