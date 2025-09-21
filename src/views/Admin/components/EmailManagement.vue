<template>
  <div class="space-y-6">
    <!-- 邮件服务状态卡片 -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">邮件服务状态</h3>
        <button
          @click="refreshStatus"
          :disabled="loading"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          刷新状态
        </button>
      </div>

      <div v-if="emailStatus" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-3">
          <div class="flex items-center">
            <span class="text-sm font-medium text-gray-500 w-20">状态:</span>
            <span :class="emailStatus?.enabled ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
              {{ emailStatus?.enabled ? '已启用' : '未启用' }}
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-sm font-medium text-gray-500 w-20">SMTP服务器:</span>
            <span class="text-sm text-gray-900">{{ emailStatus?.host || '未配置' }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-sm font-medium text-gray-500 w-20">端口:</span>
            <span class="text-sm text-gray-900">{{ emailStatus?.port || '未配置' }}</span>
          </div>
        </div>
        <div class="space-y-3">
          <div class="flex items-center">
            <span class="text-sm font-medium text-gray-500 w-20">发送邮箱:</span>
            <span class="text-sm text-gray-900">{{ emailStatus?.username || '未配置' }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-sm font-medium text-gray-500 w-20">发送者名称:</span>
            <span class="text-sm text-gray-900">{{ emailStatus?.from_name || '未配置' }}</span>
          </div>
        </div>
      </div>

      <div v-if="!emailStatus?.enabled" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">邮件服务未配置</h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>请在服务器的 .env 文件中配置以下环境变量：</p>
              <ul class="mt-1 list-disc list-inside">
                <li>SMTP_HOST (SMTP服务器地址)</li>
                <li>SMTP_PORT (SMTP端口)</li>
                <li>SMTP_USERNAME (发送邮箱)</li>
                <li>SMTP_PASSWORD (邮箱授权码)</li>
                <li>SMTP_FROM_NAME (发送者名称)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 邮件测试 -->
    <div v-if="emailStatus?.enabled" class="bg-white rounded-lg border border-gray-200 p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">邮件测试</h3>
      
      <form @submit.prevent="sendTestEmail" class="space-y-4">
        <div>
          <label for="test-email" class="block text-sm font-medium text-gray-700">测试邮箱地址</label>
          <input
            id="test-email"
            v-model="testEmail"
            type="email"
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="请输入要测试的邮箱地址"
          />
        </div>
        
        <button
          type="submit"
          :disabled="testLoading || !testEmail"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="testLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          发送测试邮件
        </button>
      </form>

      <div v-if="testResult" class="mt-4">
        <div v-if="testResult.success" class="p-4 bg-green-50 border border-green-200 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">测试邮件发送成功</h3>
              <p class="mt-1 text-sm text-green-700">{{ testResult.message }}</p>
            </div>
          </div>
        </div>
        
        <div v-else class="p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">测试邮件发送失败</h3>
              <p class="mt-1 text-sm text-red-700">{{ testResult.message }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 验证码发送测试 -->
    <div v-if="emailStatus?.enabled" class="bg-white rounded-lg border border-gray-200 p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">验证码发送测试</h3>
      
      <form @submit.prevent="sendVerificationCode" class="space-y-4">
        <div>
          <label for="verify-email" class="block text-sm font-medium text-gray-700">邮箱地址</label>
          <input
            id="verify-email"
            v-model="verifyEmail"
            type="email"
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="请输入要发送验证码的邮箱地址"
          />
        </div>
        
        <div>
          <label for="verify-type" class="block text-sm font-medium text-gray-700">验证码类型</label>
          <select
            id="verify-type"
            v-model="verifyType"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="email_verify">邮箱验证</option>
            <option value="password_reset">密码重置</option>
          </select>
        </div>
        
        <button
          type="submit"
          :disabled="verifyLoading || !verifyEmail"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="verifyLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          发送验证码
        </button>
      </form>

      <div v-if="verifyResult" class="mt-4">
        <div v-if="verifyResult.success" class="p-4 bg-green-50 border border-green-200 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">验证码发送成功</h3>
              <p class="mt-1 text-sm text-green-700">{{ verifyResult.message }}</p>
              <p v-if="verifyResult.data?.expires_at" class="mt-1 text-sm text-green-600">
                过期时间: {{ new Date(verifyResult.data.expires_at * 1000).toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
        
        <div v-else class="p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">验证码发送失败</h3>
              <p class="mt-1 text-sm text-red-700">{{ verifyResult.message }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEmailManagement } from '../composables/useEmailManagement'

const {
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
} = useEmailManagement()

const refreshStatus = () => {
  getEmailStatus()
}

onMounted(() => {
  getEmailStatus()
})
</script>