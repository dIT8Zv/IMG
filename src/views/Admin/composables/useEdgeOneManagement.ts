import { ref, reactive } from 'vue'
import { ADMIN_URLS } from '@/config/api'

interface EdgeOneStatus {
  enabled: boolean
  message?: string
}

interface OperationRecord {
  timestamp: number
  urlCount: number
  success: boolean
  message?: string
}

export function useEdgeOneManagement() {
  // 状态
  const edgeoneStatus = reactive<EdgeOneStatus>({
    enabled: false,
    message: ''
  })
  
  const statusLoading = ref(false)
  const purgeLoading = ref(false)
  const prefetchLoading = ref(false)
  const operationHistory = ref<OperationRecord[]>([])

  // 获取认证token
  const getAuthToken = () => {
    return localStorage.getItem('token')
  }

  // 创建请求头
  const createHeaders = () => {
    const token = getAuthToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // 刷新EdgeOne状态
  const refreshStatus = async () => {
    statusLoading.value = true
    try {
      const response = await fetch(ADMIN_URLS.EDGEONE_STATUS, {
        method: 'GET',
        headers: createHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        edgeoneStatus.enabled = data.data.enabled || false
        edgeoneStatus.message = data.data.message || ''
        console.log('EdgeOne状态获取成功:', data.data)
      } else {
        edgeoneStatus.enabled = false
        edgeoneStatus.message = data.message || '获取状态失败'
        console.error('获取EdgeOne状态失败:', data)
      }
    } catch (error) {
      console.error('获取EdgeOne状态时发生错误:', error)
      edgeoneStatus.enabled = false
      edgeoneStatus.message = '网络错误或服务不可用'
    } finally {
      statusLoading.value = false
    }
  }

  // 清理缓存
  const purgeCache = async (urls: string[]) => {
    if (!urls.length) {
      throw new Error('URL列表不能为空')
    }

    purgeLoading.value = true
    const startTime = Date.now()
    
    try {
      const response = await fetch(ADMIN_URLS.EDGEONE_PURGE, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ urls })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // 记录成功操作
        operationHistory.value.unshift({
          timestamp: startTime,
          urlCount: urls.length,
          success: true,
          message: data.message || '缓存清理成功'
        })
        
        // 保持历史记录在合理数量
        if (operationHistory.value.length > 20) {
          operationHistory.value = operationHistory.value.slice(0, 20)
        }
        
        return data
      } else {
        throw new Error(data.message || '缓存清理失败')
      }
    } catch (error) {
      // 记录失败操作
      operationHistory.value.unshift({
        timestamp: startTime,
        urlCount: urls.length,
        success: false,
        message: error instanceof Error ? error.message : '未知错误'
      })
      
      console.error('缓存清理失败:', error)
      throw error
    } finally {
      purgeLoading.value = false
    }
  }

  // 批量清理选中图片的缓存
  const purgeSelectedImages = async (images: any[], baseUrl = 'https://api-img.liuliyue.cn/v2/') => {
    const urls = images.map(image => `${baseUrl}${image.filename}`)
    return await purgeCache(urls)
  }

  // 清理单个图片缓存
  const purgeSingleImage = async (filename: string, baseUrl = 'https://api-img.liuliyue.cn/v2/') => {
    const url = `${baseUrl}${filename}`
    return await purgeCache([url])
  }

  // 预热缓存
  const prefetchCache = async (urls: string[]) => {
    if (!urls || urls.length === 0) {
      throw new Error('预热URL列表不能为空')
    }

    prefetchLoading.value = true
    try {
      const response = await fetch(ADMIN_URLS.EDGEONE_PREFETCH, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ urls })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // 记录操作历史
      const record: OperationRecord = {
        timestamp: Date.now(),
        urlCount: urls.length,
        success: data.success,
        message: data.message
      }
      operationHistory.value.unshift(record)
      
      // 只保留最近10条记录
      if (operationHistory.value.length > 10) {
        operationHistory.value = operationHistory.value.slice(0, 10)
      }

      if (!data.success) {
        throw new Error(data.message || '预热失败')
      }

      console.log('缓存预热成功:', data)
      return data
    } catch (error) {
      console.error('缓存预热失败:', error)
      
      // 记录失败的操作
      const record: OperationRecord = {
        timestamp: Date.now(),
        urlCount: urls.length,
        success: false,
        message: error instanceof Error ? error.message : '预热失败'
      }
      operationHistory.value.unshift(record)
      
      throw error
    } finally {
      prefetchLoading.value = false
    }
  }

  // 批量预热选中图片的缓存
  const prefetchSelectedImages = async (images: any[], baseUrl = 'https://api-img.liuliyue.cn/v2/') => {
    const urls = images.map(image => `${baseUrl}${image.filename}`)
    return await prefetchCache(urls)
  }

  // 预热单个图片缓存
  const prefetchSingleImage = async (filename: string, baseUrl = 'https://api-img.liuliyue.cn/v2/') => {
    const url = `${baseUrl}${filename}`
    return await prefetchCache([url])
  }

  return {
    // 状态
    edgeoneStatus,
    statusLoading,
    purgeLoading,
    prefetchLoading,
    operationHistory,
    
    // 方法
    refreshStatus,
    purgeCache,
    purgeSelectedImages,
    purgeSingleImage,
    prefetchCache,
    prefetchSelectedImages,
    prefetchSingleImage
  }
}