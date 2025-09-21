<template>
  <header class="fixed top-0 left-0 box-border px-[16.66px] flex justify-center w-screen h-max backdrop-blur-lg bg-white/96 border-b border-slate-900/10 z-50">
    <div class="flex justify-between items-center w-full max-w-[1666px] h-14">
      <div class="logo w-max h-full flex items-center gap-4">
        <img class="w-auto h-3/5 object-contain" src="/icon.jpg" />
        <a class="text-lg font-bold" href="/">{{ props.title }}</a>
      </div>
      
      <!-- 用户认证区域 -->
      <div class="flex items-center gap-4">
        <!-- 已登录状态 -->
        <div v-if="isLoggedIn" class="flex items-center gap-3">
          <span class="text-sm text-gray-600 hidden sm:block">
            欢迎，{{ user?.username }}
          </span>
          
          <!-- 管理后台按钮 (权限0-2的用户可见) -->
          <button
            v-if="isAdmin"
            @click="goToAdmin"
            class="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            管理后台
          </button>
          
          <button
            @click="logout"
            class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            退出
          </button>
        </div>
        
        <!-- 未登录状态 -->
        <div v-else class="flex items-center gap-2">
          <button
            @click="openAuthModal('login')"
            class="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            登录
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const props = defineProps(['title'])
const router = useRouter()

// 认证相关
const { isLoggedIn, user, logout: authLogout, openAuthModal } = useAuth()

// 权限检查：权限等级0-2的用户可以访问管理后台
const isAdmin = computed(() => {
  return isLoggedIn.value && user.value && user.value.permission_level <= 2
})

// 退出登录
const logout = () => {
  authLogout()
}

// 跳转到管理后台
const goToAdmin = () => {
  router.push('/admin')
}
</script>
