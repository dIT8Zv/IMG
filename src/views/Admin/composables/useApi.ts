import { useAuth } from '@/composables/useAuth'
import { API_CONFIG } from '@/config/api'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: string
}

export function useApi() {
  const { token } = useAuth()

  const request = async <T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // 如果有token，添加Authorization头
    if (token.value) {
      defaultHeaders['Authorization'] = `Bearer ${token.value}`
    }

    const config: RequestInit = {
      method: options.method || 'GET',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    if (options.body) {
      config.body = options.body
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  return {
    request
  }
}