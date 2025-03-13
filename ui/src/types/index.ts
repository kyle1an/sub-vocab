import '@total-typescript/ts-reset'
import 'typed-query-selector'

// https://x.com/mattpocockuk/status/1758454430666506589?s=20
declare global {
  interface ImportMetaEnv {
    VITE_SUB_API_URL: string
    VITE_PUBLIC_SUPABASE_URL: string
    VITE_PUBLIC_SUPABASE_ANON_KEY: string
    VITE_LEGACY_USER_EMAIL_SUFFIX: string
  }
  function setTimeout(...parameters: Parameters<WindowOrWorkerGlobalScope['setTimeout']>): ReturnType<WindowOrWorkerGlobalScope['setTimeout']>
}

// https://x.com/chancethedev/status/1757879569779200354?s=20
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}

export interface Option {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  count?: number
}
