<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    @click="handleBackdropClick"
  >
    <div
      class="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
      @click.stop
    >
      <!-- 头部 -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium text-gray-900">选择图片</h3>
            <p class="text-sm text-gray-500 mt-1">
              已选择 {{ selectedImages.length }} 张图片
            </p>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 搜索和过滤 -->
      <div class="p-4 border-b border-gray-200 bg-gray-50">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- 搜索框 -->
          <div class="flex-1">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索图片文件名..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- 批量操作 -->
          <div class="flex gap-2">
            <button
              @click="selectAll"
              class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              全选
            </button>
            <button
              @click="clearSelection"
              class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              清空
            </button>
          </div>
        </div>
      </div>

      <!-- 图片网格 -->
      <div class="p-4 overflow-y-auto max-h-[50vh]">
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        <div v-else-if="filteredImages.length === 0" class="text-center py-12 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>没有找到匹配的图片</p>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <div
            v-for="image in filteredImages"
            :key="image.id"
            class="relative group cursor-pointer"
            @click="toggleSelection(image)"
          >
            <!-- 选择状态覆盖层 -->
            <div
              class="absolute inset-0 rounded-lg border-2 transition-all duration-200 z-10"
              :class="isSelected(image) ? 'border-blue-500 bg-blue-500 bg-opacity-20' : 'border-transparent hover:border-gray-300'"
            >
              <!-- 选择指示器 -->
              <div
                class="absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                :class="isSelected(image) 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'bg-white border-gray-300 group-hover:border-gray-400'"
              >
                <svg v-if="isSelected(image)" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- 图片 -->
            <div class="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              <img
                :src="getImageUrl(image.filename)"
                :alt="image.filename"
                class="w-full h-full object-cover"
                @error="onImageError"
              />
            </div>

            <!-- 图片信息 -->
            <div class="mt-2">
              <p class="text-xs text-gray-600 truncate" :title="image.filename">
                {{ image.filename }}
              </p>
              <p class="text-xs text-gray-400">
                {{ formatFileSize(image.file_size) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="p-4 border-t border-gray-200 bg-gray-50">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-600">
            共 {{ filteredImages.length }} 张图片，已选择 {{ selectedImages.length }} 张
          </div>
          <div class="flex gap-3">
            <button
              @click="$emit('close')"
              class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              @click="confirmSelection"
              :disabled="selectedImages.length === 0"
              class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认选择 ({{ selectedImages.length }})
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { ImageItem } from '../types/admin'
import { API_CONFIG, ADMIN_URLS } from '@/config/api'
import { useAuth } from '@/composables/useAuth'

// Props
const props = defineProps<{
  isOpen: boolean
  initialSelectedImages?: ImageItem[]
}>()

// Emits
const emits = defineEmits<{
  close: []
  confirm: [images: ImageItem[]]
}>()

// 状态
const loading = ref(false)
const images = ref<ImageItem[]>([])
const selectedImages = ref<ImageItem[]>([])
const searchQuery = ref('')

// 认证
const { token } = useAuth()

// 计算属性
const filteredImages = computed(() => {
  if (!searchQuery.value.trim()) {
    return images.value
  }
  const query = searchQuery.value.toLowerCase()
  return images.value.filter(image => 
    image.filename.toLowerCase().includes(query)
  )
})

// 方法
const getImageUrl = (filename: string) => {
  return `${API_CONFIG.BASE_URL}/v2/${filename}`
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNNCAyMGgxNmEyIDIgMCAwIDAgMi0yVjZhMiAyIDAgMCAwLTItMkg0YTIgMiAwIDAgMC0yIDJ2MTJhMiAyIDAgMCAwIDIgMnptMi0xMGw0LjU4NiA0LjU4NmEyIDIgMCAwIDAgMi44MjggMEwxNiAxMm0tMi0ybDEuNTg2LTEuNTg2YTIgMiAwIDAgMSAyLjgyOCAwTDIwIDEwbS02LTZoLjAxIi8+PC9zdmc+'
}

const isSelected = (image: ImageItem) => {
  return selectedImages.value.some(selected => selected.id === image.id)
}

const toggleSelection = (image: ImageItem) => {
  const index = selectedImages.value.findIndex(selected => selected.id === image.id)
  if (index > -1) {
    selectedImages.value.splice(index, 1)
  } else {
    selectedImages.value.push(image)
  }
}

const selectAll = () => {
  selectedImages.value = [...filteredImages.value]
}

const clearSelection = () => {
  selectedImages.value = []
}

const confirmSelection = () => {
  emits('confirm', selectedImages.value)
}

const handleBackdropClick = () => {
  emits('close')
}

const fetchImages = async () => {
  loading.value = true
  console.log('开始获取图片列表...')
  console.log('认证状态:', {
    token: token.value,
    hasToken: !!token.value,
    tokenLength: token.value?.length || 0
  })
  
  try {
    const headers: Record<string, string> = {}
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }
    
    console.log('请求头:', headers)
    console.log('请求URL:', ADMIN_URLS.IMAGES)
    
    const response = await fetch(ADMIN_URLS.IMAGES, {
      headers
    })
    
    console.log('响应状态:', response.status, response.statusText)
    
    if (response.ok) {
      const data = await response.json()
      console.log('API返回的数据:', data) // 调试日志
      if (data.success) {
        images.value = data.data || []
        console.log('成功获取图片数量:', images.value.length)
      } else {
        console.error('API返回错误:', data.message)
        images.value = []
      }
    } else {
      console.error('获取图片列表失败，HTTP状态:', response.status)
      const errorText = await response.text()
      console.error('错误响应内容:', errorText)
      images.value = []
    }
  } catch (error) {
    console.error('获取图片列表时发生错误:', error)
  } finally {
    loading.value = false
  }
}

// 监听弹窗打开状态
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    fetchImages()
    // 初始化选中的图片
    selectedImages.value = props.initialSelectedImages ? [...props.initialSelectedImages] : []
  }
})

// 组件挂载时如果弹窗已打开则获取数据
onMounted(() => {
  if (props.isOpen) {
    fetchImages()
    selectedImages.value = props.initialSelectedImages ? [...props.initialSelectedImages] : []
  }
})
</script>