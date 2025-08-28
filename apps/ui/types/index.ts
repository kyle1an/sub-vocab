import type { MergeDeep } from 'type-fest'

import '@total-typescript/ts-reset'
import 'typed-query-selector'

import '@sub-vocab/shared-types'
import '@sub-vocab/shared-types/browser'

// https://x.com/mattpocockuk/status/1758454430666506589?s=20
declare global {
  interface ImportMetaEnv {
    VITE_SUB_API_URL: string
    VITE_PUBLIC_SUPABASE_URL: string
    VITE_PUBLIC_SUPABASE_ANON_KEY: string
    VITE_LEGACY_USER_EMAIL_SUFFIX: string
  }
}

// https://x.com/chancethedev/status/1757879569779200354?s=20
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}

declare module 'es-toolkit' {
  export function merge<T extends Record<PropertyKey, any>, S extends Record<PropertyKey, any>>(target: T, source: S): MergeDeep<T, S>
}

export interface Option {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  count?: number
}
