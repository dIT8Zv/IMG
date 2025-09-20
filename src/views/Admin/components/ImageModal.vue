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
            <div>
              <span class="font-medium text-gray-700">上传IP:</span>
              <p class="text-gray-900">{{ image.upload_ip || '未知' }}</p>
            </div>
          </div>

          <div class="pt-4 border-t">
            <div class="flex gap-2">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageItem } from '../types/admin'
import { API_CONFIG } from '@/config/api'

// 定义 props
defineProps<{
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
</script>