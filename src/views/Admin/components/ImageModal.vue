<template>
  <div
    v-if="image"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    @click="$emit('close')"
  >
    <div
      class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
      @click.stop
    >
      <div class="p-6">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-medium text-gray-900">图片详情</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4 overflow-y-auto max-h-[60vh]">
          <img
            :src="getImageUrl(image.filename)"
            :alt="image.filename"
            class="w-full h-64 object-contain rounded-lg cursor-pointer"
            @click="$emit('openFullscreen', image)"
          />

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700">文件名:</span>
              <p class="text-gray-900 break-all">{{ image.filename }}</p>
            </div>
            <div>
              <span class="font-medium text-gray-700">文件大小:</span>
              <p class="text-gray-900">{{ formatFileSize(image.file_size) }}</p>
            </div>
            <div>
              <span class="font-medium text-gray-700">上传时间:</span>
              <p class="text-gray-900">{{ formatDate(image.created_at) }}</p>
            </div>
            <div>
              <span class="font-medium text-gray-700">文件类型:</span>
              <p class="text-gray-900">{{ image.mime_type || 'image/*' }}</p>
            </div>
            <div class="col-span-2 sm:col-span-1">
              <span class="font-medium text-gray-700">上传IP:</span>
              <div class="flex items-center gap-2 mt-1">
                <p class="text-gray-900 break-all font-mono text-sm bg-gray-50 px-2 py-1 rounded border">
                  {{ image.upload_ip || '未知' }}
                </p>
                <button
                  v-if="image.upload_ip && image.upload_ip !== '未知'"
                  @click="copyToClipboard(image.upload_ip)"
                  class="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title="复制IP地址"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  v-if="canManageIPBans && image.upload_ip && image.upload_ip !== '未知'"
                  @click="showBanConfirmDialog"
                  class="flex-shrink-0 p-1 text-red-500 hover:text-red-700 transition-colors"
                  title="封禁此IP地址"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t">
            <div class="flex gap-2 flex-wrap">
              <button
                @click="$emit('copyUrl', image)"
                class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                复制链接
              </button>
              <button
                v-if="canDelete"
                @click="$emit('deleteImage', image)"
                class="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                删除图片
              </button>
              <button
                v-if="canManageIPBans && image.upload_ip && image.upload_ip !== '未知'"
                @click="showBanConfirmDialog"
                class="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 flex items-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                封禁IP
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
    :details="image?.upload_ip"
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
import { useAuth } from '@/composables/useAuth'
import { useAdminPermissions } from '../composables/useAdminPermissions'
import { useIPBanManagement } from '../composables/useIPBanManagement'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

// 定义 props
const props = defineProps<{
  image: ImageItem | null
  canDelete: boolean
}>()

// 定义事件
defineEmits<{
  close: []
  copyUrl: [image: ImageItem]
  deleteImage: [image: ImageItem]
  openFullscreen: [image: ImageItem]
}>()

const { user } = useAuth()
const { canManageIPBans } = useAdminPermissions()
const { banIP, banForm } = useIPBanManagement()

// 封禁IP对话框状态
const showBanDialog = ref(false)
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

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // 这里可以添加一个简单的提示，但为了保持组件简洁，暂时省略
    console.log('IP地址已复制到剪贴板:', text)
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案：使用传统的复制方法
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      console.log('IP地址已复制到剪贴板:', text)
    } catch (fallbackErr) {
      console.error('降级复制也失败:', fallbackErr)
    }
    document.body.removeChild(textArea)
  }
}

// 显示封禁确认对话框
const showBanConfirmDialog = () => {
  showBanDialog.value = true
}

// 处理封禁IP
const handleBanIP = async () => {
  if (!props.image?.upload_ip) return
  
  try {
    // 设置对话框为加载状态
    if (banDialogRef.value) {
      banDialogRef.value.setLoading(true)
    }
    
    // 设置banForm数据
    banForm.value.ip = props.image.upload_ip
    banForm.value.reason = '违规内容'
    banForm.value.ban_type = 'permanent'
    
    const success = await banIP()
    
    if (success) {
      // 关闭对话框
      showBanDialog.value = false
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