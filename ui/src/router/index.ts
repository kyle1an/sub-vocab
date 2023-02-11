import { createRouter, createWebHistory } from 'vue-router'
import { Sub } from '@/views/Sub/Sub'

const router = createRouter({
  history: createWebHistory(''),
  routes: [
    {
      path: '/',
      component: Sub,
      meta: { keepAlive: true },
    },
    { path: '/about', component: { template: '<div>About</div>' } },
    {
      path: '/mine',
      component: () => import('@/views/Mine/Dashboard').then(({ Dashboard }) => Dashboard),
      meta: { keepAlive: true },
      children: [
        {
          path: '',
          component: () => import('@/views/Mine/MineVocab').then(({ MineVocab }) => MineVocab),
          meta: { keepAlive: true },
        },
        {
          path: '/chart',
          component: () => import('@/views/Mine/Chart').then(({ VChart }) => VChart),
          meta: { keepAlive: true },
        },
      ],
    },
    {
      path: '/import',
      component: () => import('@/views/VocabImport/Import').then(({ Import }) => Import),
      meta: { keepAlive: true },
    },
    { path: '/login', component: () => import('@/views/Login').then(({ Login }) => Login) },
    { path: '/register', component: () => import('@/views/Register').then(({ Register }) => Register) },
    {
      path: '/user', component: () => import('@/views/user/Account').then(({ Account }) => Account),
      children: [
        {
          path: '',
          component: () => import('@/views/user/Profile').then(({ Profile }) => Profile),
        },
        {
          path: 'password',
          component: () => import('@/views/user/Password').then(({ Password }) => Password),
        },
      ],
    },
  ],
})

export default router
