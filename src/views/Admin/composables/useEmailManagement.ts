import { ref } from 'vue'
import { useApi } from './useApi'

interface EmailStatus {
  enabled: boolean
  host: string
  port: number
  username: string
  from_name: string
}

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

export function useEmailManagement() {
  const { request } = useApi()
  
  const emailStatus = ref<EmailStatus | null>(null)
  const loading = ref(false)
  
  // 测试邮件相关
  const testEmail = ref('')
  const testLoading = ref(false)
  const testResult = ref<ApiResponse | null>(null)
  
  // 验证码相关
  const verifyEmail = ref('')
  const verifyType = ref('email_verify')
  const verifyLoading = ref(false)
  const verifyResult = ref<ApiResponse | null>(null)

  // 获取邮件服务状态
  const getEmailStatus = async () => {
    loading.value = true
    try {
      const response = await request<ApiResponse<EmailStatus>>('/admin/email/status', {
        method: 'GET'
      })
      
      if (response.success) {
        emailStatus.value = response.data || null
      } else {
        console.error('获取邮件服务状态失败:', response.message)
      }
    } catch (error) {
      console.error('获取邮件服务状态失败:', error)
      emailStatus.value = null
    } finally {
      loading.value = false
    }
  }

  // 发送测试邮件
  const sendTestEmail = async () => {
    if (!testEmail.value) return
    
    testLoading.value = true
    testResult.value = null
    
    try {
      const response = await request<ApiResponse>('/admin/email/test', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail.value
        })
      })
      
      testResult.value = response
    } catch (error) {
      console.error('发送测试邮件失败:', error)
      testResult.value = {
        success: false,
        message: '发送测试邮件时发生错误'
      }
    } finally {
      testLoading.value = false
    }
  }

  // 发送验证码
  const sendVerificationCode = async () => {
    if (!verifyEmail.value) return
    
    verifyLoading.value = true
    verifyResult.value = null
    
    try {
      const response = await request<ApiResponse>('/email/send-code', {
        method: 'POST',
        body: JSON.stringify({
          email: verifyEmail.value,
          type: verifyType.value
        })
      })
      
      verifyResult.value = response
    } catch (error) {
      console.error('发送验证码失败:', error)
      verifyResult.value = {
        success: false,
        message: '发送验证码时发生错误'
      }
    } finally {
      verifyLoading.value = false
    }
  }

  return {
    emailStatus,
    loading,
    testEmail,
    testLoading,
    testResult,
    verifyEmail,
    verifyType,
    verifyLoading,
    verifyResult,
    getEmailStatus,
    sendTestEmail,
    sendVerificationCode
  }
}