import type { RouteConfig } from '@react-router/dev/routes'

import { index, layout, route } from '@react-router/dev/routes'

export default [
  layout('./(home)/layout.tsx', [
    layout('./home.tsx', [
      index('./(home)/page.tsx'),
      route('/subtitles', './(home)/subtitles/page.client.tsx'),
    ]),
    route('/mine', './(home)/mine/layout.tsx', [
      route('/mine/vocabulary', './(home)/mine/vocabulary/page.tsx'),
      route('/mine/chart', './(home)/mine/chart/page.tsx'),
    ]),
    route('/about', './(home)/about/page.tsx'),
    route('/login', './(home)/login/page.tsx'),
    route('/reset-password', './(home)/reset-password/page.tsx'),
    route('/update-password', './(home)/update-password/page.tsx'),
    route('/register', './(home)/register/page.tsx'),
    route('/user', './(home)/user/layout.tsx', [
      route('/user/profile', './(home)/user/profile/page.tsx'),
      route('/user/password', './(home)/user/password/page.tsx'),
    ]),
  ]),
] satisfies RouteConfig
