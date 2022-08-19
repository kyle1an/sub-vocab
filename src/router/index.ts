import { createRouter, createWebHistory } from 'vue-router'
import Sub from '../views/Sub.vue'
import User from '../components/user/UserPassword.vue'
import Profile from '../components/user/Profile.vue'

const About = { template: '<div>About</div>' }
const routes = [
  { path: '/', component: Sub },
  { path: '/about', component: About },
  { path: '/mine', component: () => import('../views/Mine.vue') },
  { path: '/login', component: () => import('../views/Login.vue') },
  { path: '/register', component: () => import('../views/Register.vue') },
  { path: '/user', component: () => import('../components/user/UserPassword.vue') },
  {
    path: '/users', component: () => import('../views/Account.vue'),
    children: [
      {
        path: '',
        component: Profile,
      },
      {
        path: 'password',
        component: User,
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
