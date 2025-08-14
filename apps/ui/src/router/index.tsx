import {
  createBrowserRouter,
} from 'react-router'

import Root from '@/pages/layout'

const convert = ({
  clientLoader,
  clientAction,
  default: Component,
  ...rest
}: any) => ({
  ...rest,
  loader: clientLoader,
  action: clientAction,
  Component,
})

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      {
        path: '/',
        lazy: () => import('@/pages/home').then(convert),
        children: [
          {
            path: '/',
            lazy: () => import('@/pages/page').then(convert),
          },
          {
            path: '/subtitles',
            lazy: () => import('@/pages/subtitles/page').then(convert),
          },
        ],
      },
      {
        path: '/mine',
        lazy: () => import('@/pages/mine/layout').then(convert),
        children: [
          {
            path: '/mine/vocabulary',
            lazy: () => import('@/pages/mine/vocabulary/page').then(convert),
          },
          {
            path: '/mine/chart',
            lazy: () => import('@/pages/mine/chart/page').then(convert),
          },
        ],
      },
      {
        path: '/about',
        lazy: () => import('@/pages/about/page').then(convert),
      },
      {
        path: '/login',
        lazy: () => import('@/pages/login/page').then(convert),
      },
      {
        path: '/reset-password',
        lazy: () => import('@/pages/reset-password/page').then(convert),
      },
      {
        path: '/update-password',
        lazy: () => import('@/pages/update-password/page').then(convert),
      },
      {
        path: '/register',
        lazy: () => import('@/pages/register/page').then(convert),
      },
      {
        path: '/user',
        lazy: () => import('@/pages/user/layout').then(convert),
        children: [
          {
            path: '/user/profile',
            lazy: () => import('@/pages/user/profile/page').then(convert),
          },
          {
            path: '/user/password',
            lazy: () => import('@/pages/user/password/page').then(convert),
          },
        ],
      },
    ],
  },
])
