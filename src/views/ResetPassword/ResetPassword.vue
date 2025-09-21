<template>
  <section class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="reset-password-card mx-auto">
      <div class="card-header">
        <h1>重置密码</h1>
        <p>设置您的新密码</p>
      </div>
      
      <div class="card-body">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>验证中...</p>
        </div>
        
        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3>重置链接无效</h3>
          <p>{{ error }}</p>
          <div class="error-actions">
            <button @click="requestNewReset" class="btn-primary">重新申请密码重置</button>
            <button @click="goHome" class="btn-secondary">返回首页</button>
          </div>
        </div>
        
        <!-- 成功状态 -->
        <div v-else-if="success" class="success-state">
          <div class="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <h3>重置成功</h3>
          <p>密码已更新，请使用新密码登录</p>
          <button @click="goHome" class="btn-primary">返回首页</button>
        </div>
        
        <!-- 重置表单 -->
        <form v-else @submit.prevent="handleSubmit" class="reset-form">
          <div class="form-group">
            <label for="password">新密码</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              placeholder="输入新密码"
              required
              :disabled="submitting"
            />
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              placeholder="再次输入密码"
              required
              :disabled="submitting"
            />
          </div>
          
          <div v-if="formError" class="form-error">
            {{ formError }}
          </div>
          
          <button 
            type="submit" 
            class="btn-submit"
            :disabled="submitting"
          >
            <span v-if="submitting" class="spinner-small"></span>
            {{ submitting ? '更新中...' : '更新密码' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE_URL } from '@/config/api'

const route = useRoute()
const router = useRouter()

// 状态管理
const loading = ref(true)
const error = ref('')
const success = ref(false)
const submitting = ref(false)
const formError = ref('')

// 表单数据
const formData = ref({
  password: '',
  confirmPassword: ''
})

// 重置令牌
const token = ref('')

// 验证重置令牌
const validateToken = async () => {
  try {
    token.value = route.query.token as string
    
    if (!token.value) {
      // 没有token，显示错误信息
      error.value = '缺少重置令牌。请通过邮件中的完整链接访问此页面。'
      loading.value = false
      return
    }
    
    // 调用后端API验证token
    const response = await fetch(`${API_BASE_URL}/auth/validate-reset-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token.value
      })
    })
    
    const data = await response.json()
    
    if (!response.ok || !data.success) {
      // token无效或过期，显示友好的错误信息
      if (response.status === 400) {
        error.value = '重置链接已过期或无效。密码重置链接通常在30分钟后失效，请重新申请。'
      } else {
        error.value = data.message || '重置链接无效，请重新申请密码重置。'
      }
      loading.value = false
      return
    }
    
    // token验证成功，显示重置密码表单
    loading.value = false
  } catch (err) {
    // 网络错误或其他错误
    error.value = '网络连接失败，请检查网络连接后重试。'
    loading.value = false
  }
}

// 处理表单提交
const handleSubmit = async () => {
  formError.value = ''
  
  // 表单验证
  if (!formData.value.password) {
    formError.value = '请输入新密码'
    return
  }
  
  if (formData.value.password.length < 6) {
    formError.value = '密码长度至少为6位'
    return
  }
  
  if (formData.value.password !== formData.value.confirmPassword) {
    formError.value = '两次输入的密码不一致'
    return
  }
  
  submitting.value = true
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token.value,
        new_password: formData.value.password
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      success.value = true
    } else {
      formError.value = data.message || '重置密码失败'
    }
  } catch (err) {
    formError.value = '网络错误，请稍后重试'
  } finally {
    submitting.value = false
  }
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 重新申请密码重置
const requestNewReset = () => {
  // 跳转到首页并触发登录模态框的忘记密码功能
  router.push('/?action=forgot-password')
}

// 组件挂载时验证令牌
onMounted(() => {
  validateToken()
})
</script>

<style scoped>

.reset-password-card {
  background: white;
  width: 100%;
  max-width: 420px;
}

.card-header {
  background: white;
  color: #111827;
  padding: 48px 32px 24px;
  text-align: center;
}

.card-header h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.025em;
}

.card-header p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
  font-weight: 400;
}

.card-body {
  padding: 32px;
}

.loading-state,
.error-state,
.success-state {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #111827;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.error-icon,
.success-icon {
  margin-bottom: 20px;
  color: #6b7280;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-icon {
  color: #dc2626;
}

.success-icon {
  color: #059669;
}

.error-state h3,
.success-state h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.error-state p,
.success-state p {
  margin: 0 0 28px 0;
  color: #6b7280;
  line-height: 1.6;
  font-size: 15px;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #111827;
  font-size: 14px;
  letter-spacing: 0.025em;
}

.form-group input {
  padding: 14px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: white;
}

.form-group input:focus {
  outline: none;
  border-color: #111827;
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.1);
}

.form-group input:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-error {
  color: #dc2626;
  font-size: 14px;
  text-align: center;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-weight: 500;
}

.btn-primary,
.btn-submit {
  background: #111827;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.025em;
}

.btn-secondary {
  background: white;
  color: #111827;
  border: 1px solid #d1d5db;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.025em;
}

.btn-primary:hover,
.btn-submit:hover:not(:disabled) {
  background: #374151;
  transform: translateY(-1px);
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.btn-submit:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .reset-password-container {
    padding: 16px;
  }
  
  .card-header {
    padding: 32px 24px 20px;
  }
  
  .card-body {
    padding: 24px;
  }
  
  .card-header h1 {
    font-size: 28px;
  }
  
  .reset-form {
    gap: 20px;
  }
}
</style>