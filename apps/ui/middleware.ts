import type { NextRequest } from 'next/server'

import { createI18nMiddleware } from 'next-international/middleware'

import { updateSession } from '@/lib/supabase/middleware'

const I18nMiddleware = createI18nMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  urlMappingStrategy: 'rewrite',
})

export function middleware(request: NextRequest) {
  // https://next-intl.dev/docs/routing/middleware#example-integrating-with-supabase-authentication
  const response = I18nMiddleware(request)
  return updateSession(request, response)
}

export const config = {
  matcher: ['/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)'],
}
