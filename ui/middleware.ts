import { rewrite } from '@vercel/edge'

export default function middleware(request: Request) {
  const url = new URL(request.url)
  const target = new URL(process.env.VITE_SUB_PROD ?? '')

  if (url.pathname.startsWith('/api')) {
    return rewrite(new URL(url.pathname.replace(/^\/api/, '') + url.search, target))
  }

  if (url.pathname.startsWith('/socket.io')) {
    return rewrite(new URL(url.pathname + url.search, target))
  }
}
