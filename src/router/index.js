import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import EditScript from '../components/EditScript.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/edit/:id',
    name: 'EditScript',
    component: EditScript
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 