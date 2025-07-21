// https://ethanniser.dev/blog/error-categories-in-effect
// https://gist.github.com/mikearnaldi/4e5c0be9c52fa16a119da95a32c62b89
import { Effect, Predicate, Schema as S } from 'effect'
import { hasProperty } from 'effect/Predicate'

export const categoriesKey = '@effect/error/categories'

export const withCategory =
  <Categories extends Array<PropertyKey>>(...categories: Categories) =>
    <Args extends Array<any>, Ret, C extends { new(...args: Args): Ret }>(C1: C): C & {
      new(...args: Args): Ret & { [categoriesKey]: { [Cat in Categories[number]]: true } }
    } => {
    // @ts-expect-error
      const Mixed = class extends C1 {}

      for (const category of categories) {
        if (!(categoriesKey in Mixed.prototype)) {
        // @ts-expect-error
          Mixed.prototype[categoriesKey] = {}
        }
        // @ts-expect-error
        Mixed.prototype[categoriesKey][category] = true
      }

      return Mixed as any
    }

export type AllKeys<E> = E extends { [categoriesKey]: infer Q } ? keyof Q : never
export type ExtractAll<E, Cats extends PropertyKey> = Cats extends any
  ? Extract<E, { [categoriesKey]: { [K in Cats]: any } }>
  : never

export const catchCategory = <E, const Categories extends Array<AllKeys<E>>, A2, E2, R2>(
  ...args: [
    ...Categories,
    f: (err: ExtractAll<E, Categories[number]>) => Effect.Effect<A2, E2, R2>,
  ]
) =>
  <A, R>(
    effect: Effect.Effect<A, E, R>,
  ): Effect.Effect<A | A2, E2 | Exclude<E, ExtractAll<E, Categories[number]>>, R | R2> => {
    const f = args.pop()!
    const categories = args
    return Effect.catchIf(
      effect,
      (e) => {
        if (Predicate.isObject(e) && hasProperty(categoriesKey)(e)) {
          for (const cat of categories) {
          // @ts-expect-error
            if (cat in e[categoriesKey]) {
              return true
            }
          }
        }
        return false
      }, // @ts-expect-error
      (e) => f(e),
    ) as any
  }

class FooError extends S.TaggedError<FooError>()('FooError', {})
  .pipe(withCategory('domain')) {}

class BarError extends S.TaggedError<BarError>()('BarError', {})
  .pipe(withCategory('system', 'domain')) {}

class BazError extends S.TaggedError<BazError>()('BazError', {})
  .pipe(withCategory('system')) {}

const baz = (x: number) =>
  Effect.gen(function* () {
    if (x > 2) {
      return yield* new FooError()
    } else if (x > 1) {
      return yield* new BarError()
    } else {
      return yield* new BazError()
    }
  })

export const program = baz(1).pipe(
  catchCategory('system', (_) => Effect.log(_._tag)),
)

export const program2 = baz(1).pipe(
  catchCategory('domain', (_) => Effect.log(_._tag)),
)

export const program3 = baz(1).pipe(
  catchCategory('system', 'domain', (_) => Effect.log(_._tag)),
)
