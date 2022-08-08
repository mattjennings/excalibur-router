import { Router } from 'excalibur-router'

export const router = new Router({
  routes: {
    level1: () => import('./level1'),
    level2: () => import('./level2'),
  },
})
