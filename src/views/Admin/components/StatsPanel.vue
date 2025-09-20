<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <!-- 总图片数 -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="p-3 rounded-md bg-blue-500 bg-opacity-10">
          <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">总图片数</p>
          <p class="text-2xl font-semibold text-gray-900">{{ stats.totalImages }}</p>
        </div>
      </div>
    </div>

    <!-- 存储大小 -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="p-3 rounded-md bg-green-500 bg-opacity-10">
          <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">存储大小</p>
          <p class="text-2xl font-semibold text-gray-900">{{ formatFileSize(stats.totalSize) }}</p>
        </div>
      </div>
    </div>

    <!-- 最近上传 -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="p-3 rounded-md bg-purple-500 bg-opacity-10">
          <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">最近上传</p>
          <p class="text-2xl font-semibold text-gray-900">{{ timeAgo(stats.latestUpload) }}</p>
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