<template>
  <div v-if="isAuthModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center">
    <!-- 背景遮罩 -->
    <div
      class="fixed inset-0 bg-black bg-opacity-50"
      @click="closeModal"
    ></div>

    <!-- 模态框 -->
    <div class="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
      <!-- 关闭按钮 -->
      <button
        @click="closeModal"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- 标题 -->
      <h2 class="text-2xl font-bold text-center mb-6">
        {{ isLogin ? '登录' : '注册' }}
      </h2>

      <!-- 表单 -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- 用户名 -->
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
            用户名
          </label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            autocomplete="username"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-10"
            placeholder="请输入用户名"
          />
        </div>

        <!-- 邮箱 (仅注册时显示) -->
        <div v-if="!isLogin">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            邮箱
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-10"
            placeholder="请输入邮箱"
          />
        </div>

        <!-- 密码 -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-10"
            placeholder="请输入密码"
          />
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="text-red-600 text-sm text-center">
          {{ errorMessage }}
        </div>

        <!-- 提交按钮 -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>
      </form>

      <!-- 切换登录/注册 -->
      <div class="mt-4 text-center">
        <span class="text-gray-600">
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
        </span>
        <button
          @click="toggleMode"
          class="text-blue-600 hover:text-blue-800 ml-1"
        >
          {{ isLogin ? '立即注册' : '立即登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'

const auth = useAuth()
const { isAuthModalOpen, closeAuthModal } = auth

const isLogin = ref(true)
const isLoading = ref(false)
const errorMessage = ref('')

const formData = reactive({
  username: '',
  email: '',
  password: ''
})

const closeModal = () => {
  closeAuthModal()
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
  // 重置表单
  formData.username = ''
  formData.email = ''
  formData.password = ''
}

const handleSubmit = async () => {
  if (isLoading.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    let result
    if (isLogin.value) {
      result = await auth.login(formData.username, formData.password)
    } else {
      result = await auth.register(formData.username, formData.email, formData.password)
    }

    if (result.success) {
      closeModal()
    } else {
      errorMessage.value = result.message || '操作失败，请重试'
    }
  } catch (error) {
    errorMessage.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 监听弹窗开启，重置表单
watch(() => isAuthModalOpen.value, (newVal) => {
  if (newVal) {
    formData.username = ''
    formData.email = ''
    formData.password = ''
    errorMessage.value = ''
    isLogin.value = true

    // 自动聚焦到用户名输入框
    setTimeout(() => {
      const usernameInput = document.getElementById('username')
      if (usernameInput) {
        usernameInput.focus()
      }
    }, 100)
  }
})
</script>