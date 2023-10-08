/// <reference types="vite/client" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_SUB_PROD: string
    }
  }
}
