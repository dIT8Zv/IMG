<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
      <!-- 移动端优化：垂直堆叠布局 -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <!-- 标题部分 -->
        <div class="flex-1 min-w-0">
          <h3 class="text-lg sm:text-xl font-medium text-gray-900 truncate">EdgeOne 缓存管理</h3>
          <p class="mt-1 text-sm text-gray-500 hidden sm:block">管理腾讯云 EdgeOne CDN 缓存清理</p>
          <p class="mt-1 text-xs text-gray-500 sm:hidden">CDN 缓存管理</p>
        </div>
        
        <!-- 控制区域 -->
        <div class="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3 flex-shrink-0">
          <!-- 状态指示器 -->
          <div class="flex items-center space-x-2 bg-gray-50 sm:bg-transparent px-2 py-1 sm:px-0 sm:py-0 rounded-md">
            <div 
              :class="[
                'w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0',
                edgeoneStatus.enabled ? 'bg-green-500' : 'bg-gray-400'
              ]"
            ></div>
            <span class="text-sm text-gray-600 font-medium sm:font-normal">
              {{ edgeoneStatus.enabled ? '已启用' : '未启用' }}
            </span>
          </div>
          
          <!-- 刷新状态按钮 -->
          <button
            @click="refreshStatus"
            :disabled="statusLoading"
            class="inline-flex items-center px-3 py-2 sm:px-3 sm:py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 min-w-0"
          >
            <svg 
              :class="['w-4 h-4 flex-shrink-0', statusLoading ? 'animate-spin' : '', 'sm:mr-1.5']" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="hidden sm:inline ml-1.5">刷新状态</span>
            <span class="sm:hidden sr-only">刷新</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- 服务状态卡片 -->
      <div class="mb-6 p-4 rounded-lg border" :class="edgeoneStatus.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'">
        <div class="flex items-center">
          <div 
            :class="[
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
              edgeoneStatus.enabled ? 'bg-green-100' : 'bg-gray-100'
            ]"
          >
            <svg 
              :class="['w-5 h-5', edgeoneStatus.enabled ? 'text-green-600' : 'text-gray-400']" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" v-if="edgeoneStatus.enabled" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" v-else />
            </svg>
          </div>
          <div class="ml-3">
            <h4 class="text-sm font-medium" :class="edgeoneStatus.enabled ? 'text-green-800' : 'text-gray-800'">
              {{ edgeoneStatus.enabled ? 'EdgeOne 服务已启用' : 'EdgeOne 服务未启用' }}
            </h4>
            <p class="text-sm" :class="edgeoneStatus.enabled ? 'text-green-600' : 'text-gray-600'">
              {{ edgeoneStatus.enabled ? '' : '请检查服务配置或联系管理员' }}
            </p>
          </div>
        </div>
      </div>

      <!-- 缓存管理表单 -->
      <div v-if="edgeoneStatus.enabled">
        <!-- 标签页 -->
        <div class="border-b border-gray-200 mb-4">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'purge'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'purge'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              缓存清理
            </button>
            <button
              @click="activeTab = 'prefetch'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'prefetch'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              缓存预热
            </button>
          </nav>
        </div>
        
        <!-- 缓存清理表单 -->
        <div v-if="activeTab === 'purge'" class="space-y-4">
          <!-- URL输入 -->
          <div>
            <label for="cache-urls" class="block text-sm font-medium text-gray-700 mb-2">
              要清理的URL（每行一个）
            </label>
            <textarea
              id="cache-urls"
              v-model="urlsInput"
              rows="4"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="https://api-img.liuliyue.cn/v2/example1.jpg&#10;https://api-img.liuliyue.cn/v2/example2.jpg"
            ></textarea>
            <p class="mt-1 text-xs text-gray-500">
              支持批量清理，每行输入一个完整的图片URL
            </p>
          </div>

          <!-- 快速选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              快速选择
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                @click="openImageSelector"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                选择图片 ({{ currentSelectedImages.length }})
              </button>
              <button
                @click="addSelectedImageUrls"
                :disabled="props.selectedImages.length === 0"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                添加已选图片 ({{ props.selectedImages.length }})
              </button>
              <button
                @click="clearUrls"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                清空
              </button>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200">
            <div class="text-sm text-gray-500">
              {{ urlList.length }} 个URL待清理
            </div>
            <button
              @click="purgeCache"
              :disabled="urlList.length === 0 || purgeLoading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg 
                v-if="purgeLoading"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ purgeLoading ? '清理中...' : '清理缓存' }}
            </button>
          </div>
        </div>

        <!-- 缓存预热表单 -->
        <div v-if="activeTab === 'prefetch'" class="space-y-4">
          <!-- URL输入 -->
          <div>
            <label for="prefetch-urls" class="block text-sm font-medium text-gray-700 mb-2">
              要预热的URL（每行一个）
            </label>
            <textarea
              id="prefetch-urls"
              v-model="prefetchUrlsInput"
              rows="4"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="https://api-img.liuliyue.cn/v2/example1.jpg&#10;https://api-img.liuliyue.cn/v2/example2.jpg"
            ></textarea>
            <p class="mt-1 text-xs text-gray-500">
              支持批量预热，每行输入一个完整的图片URL。预热会将资源主动加载到EdgeOne边缘节点。
            </p>
          </div>

          <!-- 快速选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              快速选择
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                @click="openPrefetchImageSelector"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                选择图片 ({{ currentPrefetchSelectedImages.length }})
              </button>
              <button
                @click="addSelectedPrefetchImageUrls"
                :disabled="props.selectedImages.length === 0"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                添加已选图片 ({{ props.selectedImages.length }})
              </button>
              <button
                @click="clearPrefetchUrls"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                清空
              </button>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200">
            <div class="text-sm text-gray-500">
              {{ prefetchUrlList.length }} 个URL待预热
            </div>
            <button
              @click="prefetchCache"
              :disabled="prefetchUrlList.length === 0 || prefetchLoading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <svg 
                v-if="prefetchLoading"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ prefetchLoading ? '预热中...' : '预热缓存' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 未启用时的提示 -->
      <div v-else class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">EdgeOne 服务未启用</h3>
        <p class="mt-1 text-sm text-gray-500">
          请联系管理员配置 EdgeOne 服务
        </p>
      </div>
    </div>

    <!-- 操作历史 -->
    <div v-if="edgeoneStatus.enabled && operationHistory.length > 0" class="border-t border-gray-200">
      <div class="px-6 py-4">
        <h4 class="text-sm font-medium text-gray-900 mb-3">最近操作</h4>
        <div class="space-y-2">
          <div 
            v-for="(operation, index) in operationHistory.slice(0, 5)" 
            :key="index"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center space-x-2">
              <div 
                :class="[
                  'w-2 h-2 rounded-full',
                  operation.success ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span class="text-gray-600">
                {{ operation.message?.includes('预热') ? '预热了' : '清理了' }} {{ operation.urlCount }} 个URL
              </span>
            </div>
            <span class="text-gray-400">
              {{ formatTime(operation.timestamp) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 图片选择弹窗 -->
  <ImageSelectorModal
    :is-open="showImageSelector"
    :initial-selected-images="currentSelectedImages"
    @close="closeImageSelector"
    @confirm="handleImageSelection"
  />
  
  <!-- 预热图片选择弹窗 -->
  <ImageSelectorModal
    :is-open="showPrefetchImageSelector"
    :initial-selected-images="currentPrefetchSelectedImages"
    @close="closePrefetchImageSelector"
    @confirm="handlePrefetchImageSelection"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useEdgeOneManagement } from '../composables/useEdgeOneManagement'
import { useAuth } from '@/composables/useAuth'
import ImageSelectorModal from './ImageSelectorModal.vue'
import type { ImageItem } from '../types/admin'

// Props
interface Props {
  selectedImages?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedImages: () => []
})

// 使用 EdgeOne 管理 composable
const {
  edgeoneStatus,
  statusLoading,
  purgeLoading,
  prefetchLoading,
  operationHistory,
  refreshStatus,
  purgeCache: performPurgeCache,
  prefetchCache: performPrefetchCache
} = useEdgeOneManagement()

// 本地状态
const activeTab = ref('purge')
const urlsInput = ref('')
const prefetchUrlsInput = ref('')
const showImageSelector = ref(false)
const showPrefetchImageSelector = ref(false)
const currentSelectedImages = ref<ImageItem[]>([])
const currentPrefetchSelectedImages = ref<ImageItem[]>([])

// 计算属性
const urlList = computed(() => {
  return urlsInput.value
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0)
})

const prefetchUrlList = computed(() => {
  return prefetchUrlsInput.value
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0)
})

// 方法
const addSelectedImageUrls = () => {
  const baseUrl = 'https://api-img.liuliyue.cn/v2/'
  const selectedUrls = props.selectedImages.map(image => `${baseUrl}${image.filename}`)
  
  const existingUrls = urlList.value
  const newUrls = selectedUrls.filter(url => !existingUrls.includes(url))
  
  if (newUrls.length > 0) {
    const currentInput = urlsInput.value.trim()
    urlsInput.value = currentInput ? `${currentInput}\n${newUrls.join('\n')}` : newUrls.join('\n')
  }
}

const clearUrls = () => {
  urlsInput.value = ''
}

const openImageSelector = () => {
  showImageSelector.value = true
}

const closeImageSelector = () => {
  showImageSelector.value = false
}

const handleImageSelection = (selectedImages: ImageItem[]) => {
  currentSelectedImages.value = selectedImages
  
  // 自动添加选中的图片URL到输入框
  const baseUrl = 'https://api-img.liuliyue.cn/v2/'
  const selectedUrls = selectedImages.map(image => `${baseUrl}${image.filename}`)
  
  const existingUrls = urlList.value
  const newUrls = selectedUrls.filter(url => !existingUrls.includes(url))
  
  if (newUrls.length > 0) {
    const currentInput = urlsInput.value.trim()
    urlsInput.value = currentInput ? `${currentInput}\n${newUrls.join('\n')}` : newUrls.join('\n')
  }
  
  closeImageSelector()
}

const purgeCache = async () => {
  if (urlList.value.length === 0) return
  
  try {
    await performPurgeCache(urlList.value)
    // 清理成功后清空输入
    urlsInput.value = ''
  } catch (error) {
    console.error('缓存清理失败:', error)
  }
}

// 预热相关方法
const addSelectedPrefetchImageUrls = () => {
  const baseUrl = 'https://api-img.liuliyue.cn/v2/'
  const selectedUrls = props.selectedImages.map(image => `${baseUrl}${image.filename}`)
  
  const existingUrls = prefetchUrlList.value
  const newUrls = selectedUrls.filter(url => !existingUrls.includes(url))
  
  if (newUrls.length > 0) {
    const currentInput = prefetchUrlsInput.value.trim()
    prefetchUrlsInput.value = currentInput ? `${currentInput}\n${newUrls.join('\n')}` : newUrls.join('\n')
  }
}

const clearPrefetchUrls = () => {
  prefetchUrlsInput.value = ''
}

const openPrefetchImageSelector = () => {
  showPrefetchImageSelector.value = true
}

const closePrefetchImageSelector = () => {
  showPrefetchImageSelector.value = false
}

const handlePrefetchImageSelection = (selectedImages: ImageItem[]) => {
  currentPrefetchSelectedImages.value = selectedImages
  
  // 自动添加选中的图片URL到输入框
  const baseUrl = 'https://api-img.liuliyue.cn/v2/'
  const selectedUrls = selectedImages.map(image => `${baseUrl}${image.filename}`)
  
  const existingUrls = prefetchUrlList.value
  const newUrls = selectedUrls.filter(url => !existingUrls.includes(url))
  
  if (newUrls.length > 0) {
    const currentInput = prefetchUrlsInput.value.trim()
    prefetchUrlsInput.value = currentInput ? `${currentInput}\n${newUrls.join('\n')}` : newUrls.join('\n')
  }
  
  closePrefetchImageSelector()
}

const prefetchCache = async () => {
  if (prefetchUrlList.value.length === 0) return
  
  try {
    await performPrefetchCache(prefetchUrlList.value)
    // 预热成功后清空输入
    prefetchUrlsInput.value = ''
  } catch (error) {
    console.error('缓存预热失败:', error)
  }
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

// 认证状态
const auth = useAuth()

// 生命周期
onMounted(() => {
  refreshStatus()
})

// 监听认证状态变化，当用户登录后重新检查服务状态
watch(() => auth.isLoggedIn.value, (isLoggedIn) => {
  if (isLoggedIn) {
    refreshStatus()
  }
}, { immediate: false })
</script>