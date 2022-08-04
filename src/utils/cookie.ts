import Cookies from 'js-cookie'

export function wrapCookie(param: object) {
  return { ...param, acct: Cookies.get('acct') }
}

export function eraseCookie(name: string | string[]) {
  if (Array.isArray(name)) {
    name.forEach((n) => eraseCookie(n))
  } else {
    document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  }
}
