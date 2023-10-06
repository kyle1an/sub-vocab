/// <reference types="vite/client" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_SUB_PROD: string
      VITE_SUB_ENV?: string
    }
  }
}
