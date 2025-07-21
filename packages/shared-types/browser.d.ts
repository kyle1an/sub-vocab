declare global {
  function setTimeout(...parameters: Parameters<WindowOrWorkerGlobalScope['setTimeout']>): ReturnType<WindowOrWorkerGlobalScope['setTimeout']>
}

export {}
