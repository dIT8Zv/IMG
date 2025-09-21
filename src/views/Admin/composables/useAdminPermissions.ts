import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import type { User } from '../types/admin'

export function useAdminPermissions() {
  const auth = useAuth()

  // 本地计算登录状态，避免响应性问题
  const isReallyLoggedIn = computed(() => {
    const hasValidUser = auth.user.value !== null && typeof auth.user.value === 'object'
    const hasValidToken = auth.token.value !== null && auth.token.value !== ''
    const isInit = auth.isInitialized.value === true

    console.log('Admin login check:', {
      hasValidUser,
      hasValidToken,
      isInit,
      user: auth.user.value,
      token: auth.token.value
    })

    return isInit && hasValidUser && hasValidToken
  })

  // 获取用户数据的计算属性
  const currentUser = computed<User | null>(() => {
    if (!isReallyLoggedIn.value || !auth.user.value) return null

    // 解构用户数据以避免代理对象问题
    const user = auth.user.value
    
    // 类型安全检查
    if (!user || typeof user !== 'object') return null
    if (!('username' in user) || !('permission_level' in user) || !('id' in user)) return null

    const userData: User = {
      username: user.username || '',
      permission_level: user.permission_level ?? 999,
      email: user.email || '',
      id: user.id || 0
    }

    console.log('Admin currentUser computed:', userData)

    return userData
  })

  // 权限控制：检查用户是否有删除权限（权限级别小于2）
  const canDeleteImages = computed(() => {
    const user = currentUser.value
    const hasUser = !!user
    const permissionLevel = user?.permission_level
    const canDelete = hasUser && permissionLevel !== undefined && permissionLevel < 2
    
    console.log('Admin canDeleteImages check:', {
      hasUser,
      permissionLevel,
      canDelete,
      user
    })
    
    if (!user) return false
    return user.permission_level < 2
  })

  // 权限控制：检查用户是否有IP封禁管理权限（权限级别为0）
  const canManageIPBans = computed(() => {
    const user = currentUser.value
    const hasUser = !!user
    const permissionLevel = user?.permission_level
    const canManage = hasUser && permissionLevel === 0
    
    console.log('Admin canManageIPBans check:', {
      hasUser,
      permissionLevel,
      canManage,
      user
    })
    
    if (!user) return false
    return user.permission_level === 0
  })

  return {
    isReallyLoggedIn,
    currentUser,
    canDeleteImages,
    canManageIPBans
  }
}