import '@total-typescript/ts-reset'
import 'typed-query-selector'

// https://x.com/mattpocockuk/status/1758454430666506589?s=20
declare global {
  interface ImportMetaEnv {
    VITE_SUB_PROD: string
  }
}

// https://x.com/chancethedev/status/1757879569779200354?s=20
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}
