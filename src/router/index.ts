import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ルート = 機体作成ページ
  { path: '/', name: 'ms', component: () => import('../pages/MsBuilder.vue') },
  // どのURLでも / に流す（任意）
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
