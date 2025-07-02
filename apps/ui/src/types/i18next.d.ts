import type { resources } from '@/i18n'

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof resources['en']
  }
}
