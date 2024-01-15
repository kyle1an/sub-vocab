import '@total-typescript/ts-reset'

export type NoInfer<T> = T & {[K in keyof T]: T[K]}
