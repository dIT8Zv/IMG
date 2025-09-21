<template>
  <div class="space-y-3">
    <div
      v-for="image in images"
      :key="image.id"
      class="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <!-- 桌面端布局 -->
      <div class="hidden sm:flex items-center p-4 gap-4">
        <!-- 缩略图 -->
        <div class="flex-shrink-0">
          <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden cursor-pointer" @click="$emit('openModal', image)">
            <img
              :src="getImageUrl(image.filename)"
              :alt="image.filename"
              class="w-full h-full object-cover"
              @error="onImageError"
            />
          </div>
        </div>

        <!-- 文件信息 -->
        <div class="flex-1 min-w-0">
          <!-- 文件名和格式 -->
          <div class="flex items-center gap-3 mb-1">
            <h3 class="text-sm font-medium text-gray-900 truncate" :title="image.filename">
              {{ image.filename }}
            </h3>
            <span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
              {{ image.mime_type?.split('/')[1]?.toUpperCase() || 'IMG' }}
            </span>
          </div>

          <!-- 基本信息 -->
          <div class="flex items-center gap-4 text-xs text-gray-500">
            <span>{{ formatFileSize(image.file_size) }}</span>
            <span>{{ formatDate(image.created_at) }}</span>
            <span>ID: {{ image.id }}</span>
            <span 
              class="group relative cursor-help"
              :title="image.upload_ip || '未知'"
            >
              IP: {{ truncateIP(image.upload_ip || '未知') }}
              <!-- 悬停显示完整IP -->
              <div class="absolute bottom-full left-0 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                {{ image.upload_ip || '未知' }}
              </div>
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex-shrink-0 flex items-center gap-2">
          <button
            @click="$emit('copyUrl', image)"
            class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            复制
          </button>
          <button
            @click="$emit('openModal', image)"
            class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            查看
          </button>
          <button
            v-if="canManageIPBans && image.upload_ip && image.upload_ip !== '未知'"
            @click="showBanConfirmDialog(image)"
            class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            :title="`封禁IP: ${image.upload_ip}`"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            封禁
          </button>
          <button
            v-if="canDelete"
            @click="$emit('deleteImage', image)"
            class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            删除
          </button>
        </div>
      </div>

      <!-- 移动端布局 -->
      <div class="sm:hidden p-4">
        <div class="flex items-start gap-4">
          <!-- 缩略图 -->
          <div class="flex-shrink-0">
            <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden cursor-pointer" @click="$emit('openModal', image)">
              <img
                :src="getImageUrl(image.filename)"
                :alt="image.filename"
                class="w-full h-full object-cover"
                @error="onImageError"
              />
            </div>
          </div>

          <!-- 文件信息 -->
          <div class="flex-1 min-w-0">
            <!-- 文件名和格式 -->
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-sm font-medium text-gray-900 truncate pr-3 leading-relaxed" :title="image.filename">
                {{ image.filename }}
              </h3>
              <span class="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded flex-shrink-0">
                {{ image.mime_type?.split('/')[1]?.toUpperCase() || 'IMG' }}
              </span>
            </div>

            <!-- 基本信息 - 分行显示 -->
            <div class="space-y-1.5 mb-3">
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <span>{{ formatFileSize(image.file_size) }}</span>
                <span>{{ formatDate(image.created_at) }}</span>
              </div>
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <span>ID: {{ image.id }}</span>
                <span 
                  class="group relative cursor-help"
                  :title="image.upload_ip || '未知'"
                >
                  IP: {{ truncateIP(image.upload_ip || '未知') }}
                  <!-- 悬停显示完整IP -->
                  <div class="absolute bottom-full left-0 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                    {{ image.upload_ip || '未知' }}
                  </div>
                </span>
              </div>
            </div>

            <!-- 移动端操作按钮 -->
            <div class="flex items-center gap-2.5 flex-wrap">
              <button
                @click="$emit('copyUrl', image)"
                class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                复制链接
              </button>
              <button
                v-if="canManageIPBans && image.upload_ip && image.upload_ip !== '未知'"
                @click="showBanConfirmDialog(image)"
                class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100"
                :title="`封禁IP: ${image.upload_ip}`"
              >
                封禁IP
              </button>
              <button
                v-if="canDelete"
                @click="$emit('deleteImage', image)"
                class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 封禁IP确认对话框 -->
  <ConfirmDialog
    :is-open="showBanDialog"
    title="确认封禁IP地址"
    :message="`您确定要封禁IP地址吗？此操作将阻止该IP地址访问系统。`"
    :details="selectedImageForBan?.upload_ip"
    confirm-text="确认封禁"
    @confirm="handleBanIP"
    @cancel="showBanDialog = false"
    ref="banDialogRef"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ImageItem } from '../types/admin'
import { API_CONFIG } from '@/config/api'
import { useAdminPermissions } from '../composables/useAdminPermissions'
import { useIPBanManagement } from '../composables/useIPBanManagement'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

// 定义 props
defineProps<{
  images: ImageItem[]
  canDelete: boolean
}>()

// 定义事件
defineEmits<{
  openModal: [image: ImageItem]
  copyUrl: [image: ImageItem]
  deleteImage: [image: ImageItem]
}>()

// 权限和IP封禁管理
const { canManageIPBans } = useAdminPermissions()
const { banIP, banForm } = useIPBanManagement()

// 封禁IP对话框状态
const showBanDialog = ref(false)
const selectedImageForBan = ref<ImageItem | null>(null)
const banDialogRef = ref<{ setLoading: (value: boolean) => void } | null>(null)

// 工具函数
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const truncateIP = (ip: string) => {
  if (!ip || ip === '未知') return ip
  
  // IPv4地址不需要截断
  if (ip.includes('.') && !ip.includes(':')) {
    return ip
  }
  
  // IPv6地址截断处理
  if (ip.includes(':')) {
    // 如果是完整的IPv6地址且长度超过20个字符，进行截断
    if (ip.length > 20) {
      // 保留前8个字符和后8个字符，中间用...连接
      return `${ip.substring(0, 8)}...${ip.substring(ip.length - 8)}`
    }
  }
  
  // 其他情况直接返回
  return ip
}

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZMMTIgOEwyMCAxNk00IDE2VjIwSDIwVjE2TTQgMTZINFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'
}

// 显示封禁确认对话框
const showBanConfirmDialog = (image: ImageItem) => {
  selectedImageForBan.value = image
  showBanDialog.value = true
}

// 处理封禁IP
const handleBanIP = async () => {
  if (!selectedImageForBan.value?.upload_ip) return
  
  try {
    // 设置对话框为加载状态
    if (banDialogRef.value) {
      banDialogRef.value.setLoading(true)
    }
    
    // 设置banForm数据
    banForm.value.ip = selectedImageForBan.value.upload_ip
    banForm.value.reason = '违规内容'
    banForm.value.ban_type = 'permanent'
    
    const success = await banIP()
    
    if (success) {
      // 关闭对话框
      showBanDialog.value = false
      selectedImageForBan.value = null
      console.log('IP封禁成功')
    } else {
      console.error('封禁IP失败')
    }
    
  } catch (error) {
    console.error('封禁IP失败:', error)
  } finally {
    // 取消加载状态
    if (banDialogRef.value) {
      banDialogRef.value.setLoading(false)
    }
  }
}
</script>