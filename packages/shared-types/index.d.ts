import type { Merge } from 'type-fest'

import type { Entries } from './types'

declare global {
  interface ObjectConstructor {
    // eslint-disable-next-line ts/method-signature-style
    assign<T extends object, U>(target: T, source: U): Merge<T, U>
    // https://github.com/microsoft/TypeScript/issues/35101#issue-522767105
    // eslint-disable-next-line ts/method-signature-style
    entries<T>(o: T): T extends ArrayLike<infer U> ? [string, U][] : Entries<T>
  }
}

export {}
