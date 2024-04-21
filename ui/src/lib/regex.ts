export function tryGetRegex(pattern: string) {
  try {
    return new RegExp(pattern)
  } catch (e) {
    return null
  }
}
