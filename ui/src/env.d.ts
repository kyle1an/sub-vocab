/// <reference types="vite/client" />

declare namespace CSS {
  namespace paintWorklet {
    export function addModule(url: URL | string): void
  }
}

interface Window {
  toggleDevtools?: () => void
}
