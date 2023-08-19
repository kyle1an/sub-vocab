import { createRouter, createWebHistory } from 'vue-router'
import Page from '@/app/page'

const router = createRouter({
  history: createWebHistory(''),
  routes: [
    {
      path: '/',
      component: Page,
      meta: { keepAlive: true },
    },
    {
      path: '/about',
      component: { template: '<div>About</div>' },
    },
    {
      path: '/mine',
      component: () => import('@/app/mine/layout'),
      meta: { keepAlive: true },
      children: [
        {
          path: '',
          component: () => import('@/app/mine/page'),
          meta: { keepAlive: true },
        },
        {
          path: 'chart',
          component: () => import('@/app/mine/chart/page'),
          meta: { keepAlive: true },
        },
      ],
    },
    {
      path: '/import',
      component: () => import('@/app/import/page'),
      meta: { keepAlive: true },
    },
    {
      path: '/login',
      component: () => import('@/app/login/page'),
    },
    {
      path: '/register',
      component: () => import('@/app/register/page'),
    },
    {
      path: '/user',
      component: () => import('@/app/user/layout'),
      children: [
        {
          path: '',
          component: () => import('@/app/user/page'),
        },
        {
          path: 'password',
          component: () => import('@/app/user/password/page'),
        },
      ],
    },
  ],
})

export default router
