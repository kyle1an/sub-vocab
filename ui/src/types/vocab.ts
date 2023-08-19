import { type WordLocator } from '@/lib/LabeledTire'

export type SrcWith<T> = {
  src: WordLocator[]
  vocab: T
}
