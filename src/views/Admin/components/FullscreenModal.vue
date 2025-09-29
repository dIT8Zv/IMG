<template>
  <div
    v-if="image"
    class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]"
    @click="$emit('close')"
  >
    <div class="relative w-full h-full flex items-center justify-center p-4">
      <img
        :src="getImageUrl(image.filename)"
        :alt="image.filename"
        class="max-w-full max-h-full object-contain"
        style="max-width: calc(100vw - 2rem); max-height: calc(100vh - 2rem);"
      />
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageItem } from '../types/admin'
import { API_CONFIG } from '@/config/api'

// 定义 props
defineProps<{
  image: ImageItem | null
}>()

// 定义事件
defineEmits<{
  close: []
}>()

// 工具函数
const getImageUrl = (filename: string) => {
  return `${API_CONFIG.BASE_URL}/v2/${filename}`
}
</script>