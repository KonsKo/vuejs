import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Event from '../views/Event.vue'
import Pref from '../views/Pref.vue'
import Login from '../views/Login.vue'
import User from '../views/User.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/event/:host_id?',
    name: 'Event',
    component: Event
  },
  {
    path: '/pref',
    name: 'Preferences',
    component: Pref
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/user',
    name: 'User',
    component: User
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
