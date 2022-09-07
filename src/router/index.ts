import { createRouter, createWebHistory } from 'vue-router'
import Sub from '@/views/Sub/Sub.vue'

const routes = [
  {
    path: '/',
    component: Sub,
    meta: { keepAlive: true },
  },
  { path: '/about', component: { template: '<div>About</div>' } },
  {
    path: '/mine',
    component: () => import('@/views/Mine/Dashboard.vue'),
    meta: { keepAlive: true },
    children: [
      {
        path: '',
        component: () => import('@/views/Mine/MyVocabulary.vue'),
        meta: { keepAlive: true },
      },
      {
        path: '/chart',
        component: () => import('@/views/Mine/Chart.vue'),
        meta: { keepAlive: true },
      },
    ],
  },
  { path: '/login', component: () => import('@/views/Login.vue') },
  { path: '/register', component: () => import('@/views/Register.vue') },
  {
    path: '/user', component: () => import('@/views/user/Account.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/user/Profile.vue'),
      },
      {
        path: 'password',
        component: () => import('@/views/user/Password.vue'),
      },
    ],
  },
]

const router = createRouter({
// 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(''),
  routes,
})

export default router
