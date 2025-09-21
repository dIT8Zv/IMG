<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- 标签导航和刷新按钮在同一行 -->
    <div class="flex items-center justify-between mb-6">
      <nav class="flex space-x-8" aria-label="Tabs">
        <button
          @click="switchTab('banned')"
          :class="[
            currentTab === 'banned'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          已封禁IP
        </button>
        <button
          @click="switchTab('unbanned')"
          :class="[
            currentTab === 'unbanned'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          已解封IP
        </button>
      </nav>
      
      <div class="flex items-center space-x-3">
        <button
          @click="showBanModal = true"
          class="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
          </svg>
          封禁IP
        </button>
        <button
          @click="handleRefresh"
          :disabled="loading"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
      </div>
    </div>



    <!-- 统计信息 - 只在已封禁IP选项卡显示 -->
    <div v-if="currentTab === 'banned' && stats" class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-blue-600">{{ stats.total }}</div>
        <div class="text-sm text-blue-600">总封禁数</div>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-green-600">{{ stats.active }}</div>
        <div class="text-sm text-green-600">活跃封禁</div>
      </div>
      <div class="bg-yellow-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-yellow-600">{{ stats.temporary }}</div>
        <div class="text-sm text-yellow-600">临时封禁</div>
      </div>
      <div class="bg-red-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-red-600">{{ stats.permanent }}</div>
        <div class="text-sm text-red-600">永久封禁</div>
      </div>
    </div>

    <!-- IP列表 -->
    <div class="overflow-hidden">
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600">加载中...</p>
      </div>

      <div v-else-if="currentList.length === 0" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="mt-2 text-gray-600">{{ currentTab === 'banned' ? '暂无封禁的IP' : '暂无已解封的IP' }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP地址
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                类型
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                封禁时间
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                到期时间
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                原因
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="ip in currentList" :key="ip.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ ip.ip_address }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span :class="!ip.expires_at ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'" 
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ !ip.expires_at ? '永久' : '临时' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span :class="ip.is_active ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'" 
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ ip.is_active ? '活跃' : '已解封' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(ip.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ ip.expires_at ? formatDate(ip.expires_at) : '永不过期' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {{ ip.reason || '无' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  v-if="currentTab === 'banned' && ip.is_active"
                  @click="handleUnbanIP(ip.ip_address)"
                  :disabled="submitting"
                  class="text-green-600 hover:text-green-900 disabled:opacity-50"
                >
                  解封
                </button>
                <span v-else-if="currentTab === 'banned'" class="text-gray-400">已过期</span>
                <button
                  v-else
                  @click="handleReBanIP(ip.ip_address)"
                  :disabled="submitting"
                  class="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  封禁IP
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- IP封禁弹窗 -->
    <div v-if="showBanModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="showBanModal = false">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <!-- 弹窗标题 -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">添加IP封禁</h3>
            <button @click="showBanModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 弹窗表单 -->
          <form @submit.prevent="handleModalBanIP" class="space-y-4">
            <div>
              <label for="modal-ip-address" class="block text-sm font-medium text-gray-700 mb-1">
                IP地址 *
              </label>
              <input
                id="modal-ip-address"
                v-model="modalBanForm.ip"
                type="text"
                placeholder="例如: 192.168.1.1"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="modal-ban-type" class="block text-sm font-medium text-gray-700 mb-1">
                封禁类型 *
              </label>
              <select
                id="modal-ban-type"
                v-model="modalBanForm.ban_type"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="temporary">临时封禁</option>
                <option value="permanent">永久封禁</option>
              </select>
            </div>

            <div v-if="modalBanForm.ban_type === 'temporary'">
              <label for="modal-duration" class="block text-sm font-medium text-gray-700 mb-1">
                封禁时长（小时）
              </label>
              <input
                id="modal-duration"
                v-model.number="modalBanForm.duration_hours"
                type="number"
                min="1"
                max="8760"
                placeholder="例如: 24"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="modal-reason" class="block text-sm font-medium text-gray-700 mb-1">
                封禁原因
              </label>
              <textarea
                id="modal-reason"
                v-model="modalBanForm.reason"
                rows="3"
                placeholder="请输入封禁原因..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showBanModal = false"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ submitting ? '封禁中...' : '封禁IP' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useIPBanManagement } from '../composables/useIPBanManagement'

// 选项卡状态
const currentTab = ref<'banned' | 'unbanned'>('banned')

// 弹窗状态
const showBanModal = ref(false)

// 弹窗表单数据
const modalBanForm = ref({
  ip: '',
  ban_type: 'temporary' as 'temporary' | 'permanent',
  duration_hours: 24,
  reason: ''
})

// 使用 composable
const {
  loading,
  submitting,
  bannedIPs,
  unbannedIPs,
  stats,
  banForm,
  loadBannedIPs,
  loadUnbannedIPs,
  refreshBannedIPs,
  refreshUnbannedIPs,
  banIP,
  unbanIP
} = useIPBanManagement()

// 计算属性
const currentList = computed(() => {
  return currentTab.value === 'banned' ? bannedIPs.value : unbannedIPs.value
})

// 方法
const switchTab = (tab: 'banned' | 'unbanned') => {
  currentTab.value = tab
  // 切换标签时自动刷新数据
  if (tab === 'banned') {
    refreshBannedIPs()
  } else {
    refreshUnbannedIPs()
  }
}

const handleRefresh = () => {
  if (currentTab.value === 'banned') {
    refreshBannedIPs()
  } else {
    refreshUnbannedIPs()
  }
}

const handleBanIP = async () => {
  const success = await banIP()
  if (success) {
    // 重置表单
    banForm.value = {
      ip: '',
      ban_type: 'temporary',
      duration_hours: 24,
      reason: ''
    }
  }
}

const handleUnbanIP = async (ipAddress: string) => {
  await unbanIP(ipAddress)
}

const handleReBanIP = async (ipAddress: string) => {
  // 设置弹窗表单的IP地址
  modalBanForm.value.ip = ipAddress
  // 打开弹窗
  showBanModal.value = true
}

const handleModalBanIP = async () => {
  // 临时设置banForm的值为弹窗表单的值
  const originalBanForm = { ...banForm.value }
  banForm.value = { ...modalBanForm.value }
  
  const success = await banIP()
  if (success) {
    // 重置弹窗表单
    modalBanForm.value = {
      ip: '',
      ban_type: 'temporary',
      duration_hours: 24,
      reason: ''
    }
    // 关闭弹窗
    showBanModal.value = false
    
    // 刷新已解封IP列表，因为该IP现在应该从已解封列表中移除
    if (currentTab.value === 'unbanned') {
      refreshUnbannedIPs()
    }
    // 同时刷新已封禁IP列表，因为该IP现在应该出现在已封禁列表中
    refreshBannedIPs()
  }
  
  // 恢复原始banForm的值
  banForm.value = originalBanForm
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  refreshBannedIPs()
})
</script>