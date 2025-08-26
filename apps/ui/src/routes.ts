import type { RouteConfig } from '@react-router/dev/routes'

import { index, layout, route } from '@react-router/dev/routes'

export default [
  layout('./pages/layout.tsx', [
    layout('./pages/home.tsx', [
      index('./pages/page.tsx'),
      route('/subtitles', './pages/subtitles/page.client.tsx'),
    ]),
    route('/mine', './pages/mine/layout.tsx', [
      route('/mine/vocabulary', './pages/mine/vocabulary/page.tsx'),
      route('/mine/chart', './pages/mine/chart/page.tsx'),
    ]),
    route('/about', './pages/about/page.tsx'),
    route('/login', './pages/login/page.tsx'),
    route('/reset-password', './pages/reset-password/page.tsx'),
    route('/update-password', './pages/update-password/page.tsx'),
    route('/register', './pages/register/page.tsx'),
    route('/user', './pages/user/layout.tsx', [
      route('/user/profile', './pages/user/profile/page.tsx'),
      route('/user/password', './pages/user/password/page.tsx'),
    ]),
  ]),
] satisfies RouteConfig
