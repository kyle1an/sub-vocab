/**
 * Creates a new function that, when called, has its `this` keyword set to the provided value,
 * with a given sequence of arguments provided as an array. This function mimics the behavior
 * of `Function.prototype.apply` but returns a new function like `Function.prototype.bind`.
 *
 * This function is overloaded to handle two cases for type safety:
 * 1. For functions that require a `this` context, `thisArg` is mandatory.
 * 2. For functions without a specific `this` context, `thisArg` is optional.
 */

// Overload 1: For functions that require a specific `this` context (e.g., class methods).
// `thisArg` is mandatory and its type is checked against the function's `this` type.
export function bindApply<T, A extends any[], R>(
  fn: (this: T, ...args: A) => R,
  thisArg: T
): (args: A) => R

// Overload 2: For functions that do not require a specific `this` context (e.g., standalone functions).
// `thisArg` is optional and can be omitted.
export function bindApply<A extends any[], R>(
  fn: (this: void, ...args: A) => R
): (args: A) => R

// Implementation that satisfies both overloads.
export function bindApply<T, A extends any[], R>(
  fn: (this: T | void, ...args: A) => R,
  thisArg?: T,
) {
  /**
   * The returned function takes an array of arguments `argArray`.
   * When this function is invoked, it calls the original function `fn`
   * using `apply`. The `this` context is set to `thisArg`.
   * The `?? null` ensures that if `thisArg` is undefined (i.e., omitted),
   * `null` is passed, which in non-strict mode defaults `this` to the global object.
   */
  return (argArray: A) => fn.apply(thisArg, argArray)
}
