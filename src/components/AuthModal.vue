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
        {{ authModalMode === 'forgot-password' ? '重置密码' : (isLogin ? '登录' : '注册') }}
      </h2>

      <!-- 表单 -->
      <form @submit.prevent="authModalMode === 'forgot-password' ? handleForgotPassword() : handleSubmit()" class="space-y-4">
        <!-- 邮箱 (登录时) / 用户名 (注册时) / 邮箱 (忘记密码时) -->
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
            {{ authModalMode === 'forgot-password' ? '邮箱' : (isLogin ? '邮箱' : '用户名') }}
          </label>
          <input
            id="username"
            v-model="formData.username"
            :type="authModalMode === 'forgot-password' || isLogin ? 'email' : 'text'"
            required
            :autocomplete="authModalMode === 'forgot-password' || isLogin ? 'email' : 'username'"
            :class="[
              'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 relative z-10',
              (authModalMode === 'forgot-password' || isLogin) && formData.username && !isLoginEmailValid ? 
                'border-red-300 focus:ring-red-500' : 
                'border-gray-300 focus:ring-blue-500'
            ]"
            :placeholder="authModalMode === 'forgot-password' ? '请输入您的邮箱地址' : (isLogin ? '请输入邮箱' : '请输入用户名')"
            @input="validateLoginEmail"
          />
          <!-- 邮箱格式错误提示 (仅登录时显示) -->
          <div v-if="isLogin && formData.username && !isLoginEmailValid" class="text-red-500 text-sm mt-1">
            请输入正确的邮箱格式
          </div>
        </div>

        <!-- 邮箱 (仅注册时显示) -->
        <div v-if="!isLogin && authModalMode !== 'forgot-password'">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            邮箱
          </label>
          <div class="space-y-2">
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              autocomplete="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-10"
              placeholder="请输入邮箱"
              @blur="validateEmail"
            />
            <button
              type="button"
              @click="sendVerificationCode"
              :disabled="!isEmailValid || isSendingCode || countdown > 0"
              class="w-full px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              <span class="flex items-center justify-center gap-2">
                <svg v-if="!isSendingCode && countdown === 0" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <svg v-if="isSendingCode" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-if="countdown > 0" class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ countdown > 0 ? `${countdown}s 后重新发送` : (isSendingCode ? '发送中...' : '发送验证码') }}
              </span>
            </button>
          </div>
        </div>

        <!-- 验证码 (仅注册时显示) -->
        <div v-if="!isLogin && authModalMode !== 'forgot-password' && isCodeSent">
          <label for="verificationCode" class="block text-sm font-medium text-gray-700 mb-1">
            验证码
          </label>
          <input
            id="verificationCode"
            v-model="formData.verificationCode"
            type="text"
            required
            maxlength="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-10"
            placeholder="请输入6位验证码"
          />
          <p class="text-sm text-gray-500 mt-1">
            验证码已发送到您的邮箱，请查收
          </p>
        </div>

        <!-- 密码 -->
        <div v-if="authModalMode !== 'forgot-password'">
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
          <!-- 忘记密码按钮 (仅登录时显示) -->
          <div v-if="isLogin" class="text-right mt-2">
            <button
              type="button"
              @click="handleForgotPassword"
              class="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:underline"
            >
              忘记密码？
            </button>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="text-red-600 text-sm text-center">
          {{ errorMessage }}
        </div>

        <!-- 邮箱已存在提示 -->
        <div v-if="showEmailExistsError" class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <div class="flex items-center justify-center gap-2 text-amber-700 mb-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            <span class="font-medium">该邮箱已注册</span>
          </div>
          <p class="text-amber-600 text-sm mb-3">
            邮箱 <span class="font-medium">{{ formData.email }}</span> 已经注册过账号
          </p>
          <button
            type="button"
            @click="switchToLogin"
            class="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 py-2 px-4 rounded-md font-medium text-sm transition-colors border border-amber-300"
          >
            切换到登录模式
          </button>
        </div>

        <!-- 成功信息 -->
        <div v-if="successMessage" class="text-green-600 text-sm text-center">
          {{ successMessage }}
        </div>

        <!-- 提交按钮 -->
        <button
          type="submit"
          :disabled="isLoading || ((authModalMode === 'forgot-password' || isLogin) && formData.username && !isLoginEmailValid) || false"
          class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
        >
          <span class="flex items-center justify-center gap-2">
            <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-if="!isLoading && !isLogin" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            <svg v-if="!isLoading && isLogin" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            {{ isLoading ? '处理中...' : (authModalMode === 'forgot-password' ? '发送重置链接' : (isLogin ? '登录' : '注册')) }}
          </span>
        </button>
      </form>

      <!-- 切换登录/注册 -->
      <div v-if="authModalMode !== 'forgot-password'" class="mt-4 text-center">
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
      
      <!-- 忘记密码模式下的返回链接 -->
      <div v-if="authModalMode === 'forgot-password'" class="mt-4 text-center">
        <button
          type="button"
          @click="openAuthModal('login')"
          class="text-sm text-blue-600 hover:text-blue-800"
        >
          返回登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { EMAIL_URLS, AUTH_URLS } from '@/config/api'

const auth = useAuth()
const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal } = auth

const isLogin = ref(true)
const isForgotPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showEmailExistsError = ref(false)
const isSendingCode = ref(false)
const isCodeSent = ref(false)
const countdown = ref(0)
const isEmailValid = ref(false)
const isLoginEmailValid = ref(true) // 登录邮箱验证状态

const formData = reactive({
  username: '',
  email: '',
  password: '',
  verificationCode: ''
})

const closeModal = () => {
  closeAuthModal()
}

const toggleMode = () => {
  const newMode = isLogin.value ? 'register' : 'login'
  openAuthModal(newMode)
}

// 切换到登录模式（保留邮箱信息）
const switchToLogin = () => {
  const currentEmail = formData.email
  openAuthModal('login')
  // 在下一个tick中设置邮箱信息，确保模式切换完成
  setTimeout(() => {
    formData.username = currentEmail // 将邮箱作为用户名
  }, 0)
}

// 验证邮箱格式
const validateEmail = () => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  isEmailValid.value = emailRegex.test(formData.email)
}

// 验证登录邮箱格式
const validateLoginEmail = () => {
  if (!isLogin.value || !formData.username) {
    isLoginEmailValid.value = true
    return
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  isLoginEmailValid.value = emailRegex.test(formData.username)
}

// 发送验证码
const sendVerificationCode = async () => {
  if (!isEmailValid.value || isSendingCode.value) return

  isSendingCode.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch(EMAIL_URLS.SEND_CODE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        type: 'email_verify'
      }),
    })

    const data = await response.json()

    if (data.success) {
      isCodeSent.value = true
      successMessage.value = '验证码已发送到您的邮箱，请查收'
      startCountdown()
    } else {
      errorMessage.value = data.message || '发送验证码失败'
    }
  } catch (error) {
    errorMessage.value = '网络错误，请稍后重试'
  } finally {
    isSendingCode.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleSubmit = async () => {
  if (isLoading.value) return

  // 登录时检查邮箱格式
  if (isLogin.value) {
    if (!formData.username) {
      errorMessage.value = '请输入邮箱'
      return
    }
    if (!isLoginEmailValid.value) {
      errorMessage.value = '请输入正确的邮箱格式'
      return
    }
  }

  // 注册时检查验证码
  if (!isLogin.value) {
    if (!isCodeSent.value) {
      errorMessage.value = '请先发送验证码'
      return
    }
    if (!formData.verificationCode) {
      errorMessage.value = '请输入验证码'
      return
    }
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    let result
    if (isLogin.value) {
      result = await auth.login(formData.username, formData.password)
    } else {
      // 先验证验证码
      const verifyResponse = await fetch(EMAIL_URLS.VERIFY_CODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code: formData.verificationCode,
          type: 'email_verify'
        }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyData.success) {
        errorMessage.value = verifyData.message || '验证码验证失败'
        return
      }

      // 验证码通过后进行注册
      result = await auth.register(formData.username, formData.email, formData.password, formData.verificationCode)
    }

    if (result.success) {
      successMessage.value = isLogin.value ? '登录成功！' : '注册成功！'
      // 延迟关闭模态框，让用户看到成功提示
      setTimeout(() => {
        closeModal()
      }, 1000)
    } else {
      // 检查是否是邮箱已存在的错误
      if (!isLogin.value && result.message === '该邮箱已注册，请直接登录') {
        // 显示特殊的错误提示，包含切换到登录的选项
        showEmailExistsError.value = true
        errorMessage.value = ''
      } else {
        errorMessage.value = result.message || '操作失败，请重试'
        showEmailExistsError.value = false
      }
    }
  } catch (error) {
    errorMessage.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 处理忘记密码
const handleForgotPassword = async () => {
  // 检查是否输入了邮箱
  if (!formData.username.trim()) {
    errorMessage.value = '请先输入邮箱'
    return
  }
  
  // 清除之前的错误信息
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    const response = await fetch(AUTH_URLS.FORGOT_PASSWORD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.username
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      successMessage.value = '如果该邮箱已注册，您将收到密码重置邮件，请查看您的邮箱。'
      // 清空表单
      formData.username = ''
    } else {
      errorMessage.value = data.message || '发送重置邮件失败，请稍后重试'
    }
  } catch (error) {
    console.error('忘记密码请求失败:', error)
    errorMessage.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 监听authModalMode变化
watch(() => authModalMode.value, (newVal, oldVal) => {
  if (isAuthModalOpen.value) {
    isLogin.value = newVal === 'login'
    isForgotPassword.value = newVal === 'forgot-password'
    
    // 根据模式设置提示信息
    if (newVal === 'forgot-password') {
      successMessage.value = '请输入您的邮箱地址，我们将发送密码重置链接到您的邮箱。'
    } else {
      // 非忘记密码模式下清除提示信息
      successMessage.value = ''
    }
  }
})

// 监听弹窗开启，重置表单
watch(() => isAuthModalOpen.value, (newVal) => {
  if (newVal) {
    // 重置表单和状态
    formData.username = ''
    formData.email = ''
    formData.password = ''
    formData.verificationCode = ''
    errorMessage.value = ''
    successMessage.value = ''
    showEmailExistsError.value = false
    isLogin.value = authModalMode.value === 'login'
    isForgotPassword.value = authModalMode.value === 'forgot-password'
    // 重置验证码相关状态
    isCodeSent.value = false
    isSendingCode.value = false
    countdown.value = 0
    isEmailValid.value = false

    // 根据模式设置提示信息
    if (authModalMode.value === 'forgot-password') {
      successMessage.value = '请输入您的邮箱地址，我们将发送密码重置链接到您的邮箱。'
    } else {
      // 非忘记密码模式下清除提示信息
      successMessage.value = ''
    }

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