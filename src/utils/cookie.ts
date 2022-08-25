import Cookies from 'js-cookie'

export function wrapCookie(param: object) {
  return { ...param, acct: Cookies.get('acct') }
}
