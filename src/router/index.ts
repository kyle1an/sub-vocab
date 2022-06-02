import { createRouter, createWebHistory } from 'vue-router';
import Sub from '../views/Sub.vue';

const About = { template: '<div>About</div>' }
const routes = [
  { path: '/', component: Sub },
  { path: '/about', component: About },
  { path: '/mine', component: () => import('../views/Mine.vue') },
  { path: '/login', component: () => import('../views/Login.vue') },
]

const router = createRouter({
// 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(''),
  routes,
})

export default router;
