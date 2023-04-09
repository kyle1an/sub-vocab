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

export * from './vocab'
