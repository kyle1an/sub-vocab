import type { RouteConfig } from '@react-router/dev/routes'

export default [
  {
    path: '/',
    file: './pages/layout.tsx',
    children: [
      {
        path: '/',
        file: './pages/home.tsx',
        children: [
          {
            path: '/',
            file: './pages/page.tsx',
          },
          {
            path: '/subtitles',
            file: './pages/subtitles/page.tsx',
          },
        ],
      },
      {
        path: '/mine',
        file: './pages/mine/layout.tsx',
        children: [
          {
            path: '/mine/vocabulary',
            file: './pages/mine/vocabulary/page.tsx',
          },
          {
            path: '/mine/chart',
            file: './pages/mine/chart/page.tsx',
          },
        ],
      },
      {
        path: '/about',
        file: './pages/about/page.tsx',
      },
      {
        path: '/login',
        file: './pages/login/page.tsx',
      },
      {
        path: '/reset-password',
        file: './pages/reset-password/page.tsx',
      },
      {
        path: '/update-password',
        file: './pages/update-password/page.tsx',
      },
      {
        path: '/register',
        file: './pages/register/page.tsx',
      },
      {
        path: '/user',
        file: './pages/user/layout.tsx',
        children: [
          {
            path: '/user/profile',
            file: './pages/user/profile/page.tsx',
          },
          {
            path: '/user/password',
            file: './pages/user/password/page.tsx',
          },
        ],
      },
    ],
  },
] satisfies RouteConfig
