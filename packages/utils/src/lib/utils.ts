import type { Effect } from 'effect/Effect'

export const ensureErrorType = <E>() => <A, E2 extends E, R>(effect: Effect<A, E2, R>): Effect<A, E2, R> => effect
