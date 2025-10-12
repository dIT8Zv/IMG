<template>
  <header
    ref="headerRef"
    class="fixed top-0 left-0 box-border px-[16.66px] flex justify-center w-screen h-max backdrop-blur-lg bg-white/96 border-b border-slate-900/10 z-50"
    :style="headerStyles"
  >
    <div class="flex justify-between items-center w-full max-w-[1666px] h-14">
      <div class="logo w-max h-full flex items-center gap-2">
        <img
          class="w-auto h-full object-contain"
          src="/logo.svg"
          :style="logoStyles"
        />
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const props = defineProps(['title'])
const router = useRouter()
const headerRef = ref<HTMLElement>()

// 认证相关
const { isLoggedIn, user, logout: authLogout, openAuthModal } = useAuth()

// 权限检查：权限等级0-2的用户可以访问管理后台
const isAdmin = computed(() => {
  return isLoggedIn.value && user.value && user.value.permission_level <= 2
})

// 背景检测相关
const isDarkBackground = ref(false)

// 检测背景颜色
const checkBackground = () => {
  if (!headerRef.value) return

  // 获取header元素
  const header = headerRef.value

  // 计算header下方的背景
  const scrollY = window.scrollY
  const headerHeight = header.offsetHeight

  // 如果页面有滚动，检测header下方的背景
  if (scrollY > 0) {
    // 检测页面背景色（这里简化处理，实际项目中可能需要更复杂的逻辑）
    const bodyStyle = window.getComputedStyle(document.body)
    const bgColor = bodyStyle.backgroundColor

    // 简单的背景色判断
    if (bgColor && bgColor.includes('0, 0, 0') || bgColor.includes('rgb(0, 0, 0)')) {
      isDarkBackground.value = true
    } else {
      isDarkBackground.value = false
    }
  } else {
    // 默认白色背景
    isDarkBackground.value = false
  }
}

// 根据背景设置logo的CSS变量
const logoStyles = computed(() => {
  if (isDarkBackground.value) {
    return {
      '--logo-fill': '#ffffff',
      '--logo-stroke': '#cccccc',
      'filter': 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' // 黑色背景下发光效果
    }
  } else {
    return {
      '--logo-fill': '#000000',
      '--logo-stroke': '#333333',
      'filter': 'drop-shadow(0 0 8px rgba(0,0,0,0.1))' // 白色背景下轻微阴影
    }
  }
})

// header的样式（可选：根据背景动态调整header样式）
const headerStyles = computed(() => {
  return {
    transition: 'all 0.3s ease'
  }
})

// 退出登录
const logout = () => {
  authLogout()
}

// 跳转到管理后台
const goToAdmin = () => {
  router.push('/admin')
}

// 监听滚动事件
onMounted(() => {
  checkBackground()
  window.addEventListener('scroll', checkBackground)
  window.addEventListener('resize', checkBackground)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkBackground)
  window.removeEventListener('resize', checkBackground)
})
</script>
