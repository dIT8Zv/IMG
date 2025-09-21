<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    <div
      v-for="image in images"
      :key="image.id"
      class="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <!-- Image Preview -->
      <div class="aspect-square bg-gray-200 relative group cursor-pointer" @click="$emit('openModal', image)">
        <img
          :src="getImageUrl(image.filename)"
          :alt="image.filename"
          class="w-full h-full object-cover"
          @error="onImageError"
        />
        <div class="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            @click.stop="$emit('openModal', image)"
            class="px-3 py-1.5 bg-white text-gray-900 text-sm rounded-md hover:bg-gray-100 transition-colors"
          >
            详情
          </button>
        </div>
      </div>

      <!-- Image Info -->
      <div class="p-4">
        <p class="text-sm font-medium text-gray-900 truncate" :title="image.filename">
          {{ image.filename }}
        </p>
        <p class="text-xs text-gray-500 mt-1">
          {{ formatFileSize(image.file_size) }}
        </p>
        <p class="text-xs text-gray-500">
          {{ formatDate(image.created_at) }}
        </p>
        <p class="text-xs text-gray-500 flex items-center">
          <span class="flex-shrink-0">IP: </span>
          <span 
            class="truncate ml-1" 
            :title="image.upload_ip || '未知'"
          >{{ image.upload_ip || '未知' }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageItem } from '../types/admin'
import { API_CONFIG } from '@/config/api'

// 定义 props
defineProps<{
  images: ImageItem[]
  canDelete: boolean
}>()

// 定义事件
defineEmits<{
  openModal: [image: ImageItem]
  deleteImage: [image: ImageItem]
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

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZMMTIgOEwyMCAxNk00IDE2VjIwSDIwVjE2TTQgMTZINFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'
}
</script>