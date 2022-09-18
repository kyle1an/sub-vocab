import type { FormItemRule } from 'element-plus'
import { t } from '@/i18n'
import { isUsernameTaken } from '@/api/user'

export function checkUsername(rule: FormItemRule | FormItemRule[], username: string, callback: (arg0?: Error) => void) {
  if (!username.length) {
    return callback(new Error(t('Please input name')))
  }

  if (username.length > 20) {
    return callback(new Error(t('Please use a shorter name')))
  }

  if (username.length < 2) {
    return callback(new Error(t('NameLimitMsg')))
  }
}

export async function checkUsernameTaken(rule: FormItemRule | FormItemRule[], username: string, callback: (arg0?: Error) => void) {
  if ((await isUsernameTaken({ username })).has) {
    return callback(new Error(`${username}${t('alreadyTaken')}`))
  }
}

export function noEmptyPassword(rule: FormItemRule | FormItemRule[], password: string, callback: (arg0?: Error) => void) {
  if (password === '') {
    return callback(new Error(t('Please input the password')))
  }
}
