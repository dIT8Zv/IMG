import { ref, computed, readonly } from 'vue'
import { AUTH_URLS } from '@/config/api'

export interface User {
  id: number
  username: string
  email: string
  permission_level: number
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  data?: {
    token: string
    user: User
  }
}

// 全局状态
let globalToken = ref<string | null>(null)
let globalUser = ref<User | null>(null)
let globalIsInitialized = ref(false)
let globalIsAuthModalOpen = ref(false)
let globalAuthModalMode = ref<'login' | 'register' | 'forgot-password'>('login')

// 初始化token
if (typeof window !== 'undefined') {
  const storedToken = localStorage.getItem('token')
  if (storedToken) {
    globalToken.value = storedToken
  }
}

const globalIsLoggedIn = computed(() => {
  // 只有在初始化完成且有用户数据时才认为已登录
  const hasToken = !!globalToken.value
  const hasUser = !!globalUser.value
  const isInit = globalIsInitialized.value
  const result = isInit && hasToken && hasUser
  console.log('isLoggedIn computed:', {
    initialized: isInit,
    hasToken,
    hasUser,
    token: globalToken.value,
    user: globalUser.value,
    result
  })
  return result
})

export function useAuth() {
  const login = async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(AUTH_URLS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data: AuthResponse = await response.json()

      console.log('Login response:', data)
      if (data.success && data.data) {
        globalToken.value = data.data.token
        globalUser.value = data.data.user
        globalIsInitialized.value = true
        console.log('Login success, user data:', data.data.user)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.data.token)
        }
      }

      return data
    } catch (error) {
      return {
        success: false,
        message: '网络错误，请稍后重试'
      }
    }
  }

  const register = async (username: string, email: string, password: string, verificationCode?: string): Promise<AuthResponse> => {
    try {
      const requestBody: any = { username, email, password }
      if (verificationCode) {
        requestBody.verification_code = verificationCode
      }

      const response = await fetch(AUTH_URLS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data: AuthResponse = await response.json()

      console.log('Register response:', data)
      if (data.success && data.data) {
        globalToken.value = data.data.token
        globalUser.value = data.data.user
        globalIsInitialized.value = true
        console.log('Register success, user data:', data.data.user)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.data.token)
        }
      }

      return data
    } catch (error) {
      return {
        success: false,
        message: '网络错误，请稍后重试'
      }
    }
  }

  const logout = () => {
    console.log('Logout function called')
    globalToken.value = null
    globalUser.value = null
    globalIsInitialized.value = true
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      // 清除所有相关的 localStorage 数据
      localStorage.clear()
    }
    console.log('Logout completed, token:', globalToken.value, 'user:', globalUser.value)
  }

  const getCurrentUser = async (): Promise<boolean> => {
    if (!globalToken.value) {
      globalIsInitialized.value = true
      return false
    }

    try {
      const response = await fetch(AUTH_URLS.USER, {
        headers: {
          'Authorization': `Bearer ${globalToken.value}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          globalUser.value = data.data
          globalIsInitialized.value = true
          return true
        }
      }

      // Token invalid, clear it
      logout()
      globalIsInitialized.value = true
      return false
    } catch (error) {
      logout()
      globalIsInitialized.value = true
      return false
    }
  }

  // 自动初始化用户状态
  const initializeAuth = async () => {
    if (typeof window !== 'undefined' && !globalIsInitialized.value) {
      if (globalToken.value) {
        await getCurrentUser()
      } else {
        globalIsInitialized.value = true
      }
    }
  }

  // 在组合式函数初始化时自动验证token
  if (typeof window !== 'undefined') {
    // 使用 nextTick 确保在 DOM 准备好后初始化
    setTimeout(() => {
      initializeAuth()
    }, 0)
  }

  // 模态框控制函数
  const openAuthModal = (mode: 'login' | 'register' | 'forgot-password' = 'login') => {
    globalAuthModalMode.value = mode
    globalIsAuthModalOpen.value = true
  }

  const closeAuthModal = () => {
    globalIsAuthModalOpen.value = false
    globalAuthModalMode.value = 'login' // 重置为默认模式
  }

  return {
    token: globalToken,
    user: globalUser,
    isLoggedIn: globalIsLoggedIn,
    isInitialized: globalIsInitialized,
    isAuthModalOpen: globalIsAuthModalOpen,
    authModalMode: globalAuthModalMode,
    login,
    register,
    logout,
    getCurrentUser,
    initializeAuth,
    openAuthModal,
    closeAuthModal
  }
}