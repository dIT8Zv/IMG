import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home/Home.vue'),
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/Admin/Admin.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/access-denied',
      name: 'AccessDenied',
      component: () => import('@/views/AccessDenied/AccessDenied.vue'),
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/views/NotFound/NotFound.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFoundCatch',
      component: () => import('@/views/NotFound/NotFound.vue'),
    },
  ],
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const auth = useAuth()
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 等待认证状态初始化
    if (!auth.isInitialized.value) {
      // 等待认证初始化完成
      await auth.initializeAuth()
    }
    
    checkAuth(to, from, next, auth)
  } else {
    next()
  }
})

function checkAuth(to: any, from: any, next: any, auth: any) {
  // 检查是否已登录
  if (!auth.isLoggedIn.value || !auth.user.value) {
    // 未登录，直接跳转到访问拒绝页面
    next('/access-denied')
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin) {
    const userPermissionLevel = auth.user.value.permission_level
    if (userPermissionLevel > 2) {
      // 权限不足，跳转到访问拒绝页面
      next('/access-denied')
      return
    }
  }
  
  next()
}

export default router
