import { ref, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { API_CONFIG } from '@/config/api'

interface BannedIP {
  id: number
  ip_address: string
  reason: string
  banned_by: string
  expires_at?: string
  is_active: boolean
  is_expired: boolean
  created_at: string
  updated_at: string
}

interface BanStats {
  total: number
  active: number
  permanent: number
  temporary: number
}

interface BanForm {
  ip: string
  ban_type: 'temporary' | 'permanent'
  duration_hours?: number
  reason: string
}

export function useIPBanManagement() {
  const auth = useAuth()
  
  // 状态
  const loading = ref(false)
  const submitting = ref(false)
  const bannedIPs = ref<BannedIP[]>([])
  const unbannedIPs = ref<BannedIP[]>([])
  const stats = ref<BanStats | null>(null)
  
  // 表单数据
  const banForm = ref<BanForm>({
    ip: '',
    ban_type: 'temporary',
    duration_hours: 24,
    reason: ''
  })

  // API请求头
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth.token.value}`
  })

  // 加载封禁列表
  const loadBannedIPs = async () => {
    if (!auth.token.value) {
      console.error('No auth token available')
      return
    }

    loading.value = true
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/banned-ips`, {
        method: 'GET',
        headers: getHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      bannedIPs.value = data.data || []
    } catch (error) {
      console.error('Failed to load banned IPs:', error)
      // 可以添加toast通知
    } finally {
      loading.value = false
    }
  }

  // 加载统计信息
  const loadStats = async () => {
    if (!auth.token.value) return

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/banned-ips/stats`, {
        method: 'GET',
        headers: getHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      stats.value = data.data
    } catch (error) {
      console.error('Failed to load ban stats:', error)
    }
  }

  // 加载已解封IP列表
  const loadUnbannedIPs = async () => {
    if (!auth.token.value) {
      console.error('No auth token available')
      return
    }

    loading.value = true
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/banned-ips?active_only=false`, {
        method: 'GET',
        headers: getHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      // 过滤出已解封的IP（is_active为false）
      unbannedIPs.value = (data.data || []).filter((ip: BannedIP) => !ip.is_active)
    } catch (error) {
      console.error('Failed to load unbanned IPs:', error)
    } finally {
      loading.value = false
    }
  }

  // 刷新数据
  const refreshBannedIPs = async () => {
    await Promise.all([
      loadBannedIPs(),
      loadStats()
    ])
  }

  // 刷新已解封IP数据
  const refreshUnbannedIPs = async () => {
    await loadUnbannedIPs()
  }

  // 封禁IP
  const banIP = async (): Promise<boolean> => {
    if (!auth.token.value) {
      console.error('No auth token available')
      return false
    }

    if (!banForm.value.ip.trim()) {
      console.error('IP address is required')
      return false
    }

    submitting.value = true
    try {
      const requestBody: any = {
        ip_address: banForm.value.ip.trim(),
        reason: banForm.value.reason.trim() || undefined
      }

      // 如果是临时封禁，计算过期时间
      if (banForm.value.ban_type === 'temporary' && banForm.value.duration_hours) {
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + banForm.value.duration_hours)
        requestBody.expires_at = expiresAt.toISOString()
      }
      // 永久封禁不设置expires_at，后端会将其设为null

      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/banned-ips`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.message) {
        console.log('IP banned successfully:', data.message)
        await refreshBannedIPs() // 刷新列表
        return true
      } else {
        throw new Error(data.error || '封禁IP失败')
      }
    } catch (error) {
      console.error('Failed to ban IP:', error)
      return false
    } finally {
      submitting.value = false
    }
  }

  // 解封IP
  const unbanIP = async (ipAddress: string): Promise<boolean> => {
    if (!auth.token.value) {
      console.error('No auth token available')
      return false
    }

    submitting.value = true
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/banned-ips/unban`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ip_address: ipAddress
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.message) {
        console.log('IP unbanned successfully:', data.message)
        await refreshBannedIPs() // 刷新列表
        return true
      } else {
        throw new Error(data.error || '解封IP失败')
      }
    } catch (error) {
      console.error('Failed to unban IP:', error)
      return false
    } finally {
      submitting.value = false
    }
  }

  return {
    loading,
    submitting,
    bannedIPs,
    unbannedIPs,
    stats,
    banForm,
    loadBannedIPs,
    loadUnbannedIPs,
    loadStats,
    refreshBannedIPs,
    refreshUnbannedIPs,
    banIP,
    unbanIP
  }
}