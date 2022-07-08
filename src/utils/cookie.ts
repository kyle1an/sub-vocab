export function wrapCookie(param: object) {
  return { ...param, acct: getCookie('acct') }
}

export function setCookie(name: string, value: any, days: any) {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

function cookie(name: string, value: any, options: any = {}) {
  let cookieData = `${name}=${value};`
  for (const key in options) {
    const str = `${key}=${options[key]};`
    cookieData += str
  }
  document.cookie = cookieData
}

export function getCookie(name: string) {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

export function eraseCookie(name: string | string[]) {
  if (Array.isArray(name)) {
    name.forEach((n) => eraseCookie(n))
  } else {
    document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  }
}
