<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
    <!-- 总图片数 -->
    <div class="group relative overflow-hidden bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-5 hover:shadow-md transition-all duration-300">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">总图片数</p>
          <p class="text-xl sm:text-2xl font-bold text-gray-900 truncate">{{ stats.totalImages }}</p>
        </div>
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0 ml-2">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- 存储大小 -->
    <div class="group relative overflow-hidden bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-5 hover:shadow-md transition-all duration-300">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">存储大小</p>
          <p class="text-xl sm:text-2xl font-bold text-gray-900 truncate">{{ formatFileSize(stats.totalSize) }}</p>
        </div>
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0 ml-2">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </div>
    </div>

    <!-- 最近上传 -->
    <div class="group relative overflow-hidden bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-5 hover:shadow-md transition-all duration-300 sm:col-span-2 md:col-span-1">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">最近上传</p>
          <p class="text-xl sm:text-2xl font-bold text-gray-900 truncate">{{ timeAgo(stats.latestUpload) }}</p>
        </div>
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0 ml-2">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminStats } from '../types/admin'

// 定义 props
defineProps<{
  stats: AdminStats
}>()

// 工具函数
const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const timeAgo = (timestamp: number | null) => {
  if (!timestamp) return '无'
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}
</script>