<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-gray-200">
    <!-- 每页显示数量选择器 -->
    <div class="flex items-center gap-2 text-sm text-gray-700">
      <span>每页显示</span>
      <select
        :value="itemsPerPage"
        @change="handleItemsPerPageChange"
        class="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
      <span>条</span>
    </div>

    <!-- 分页信息 -->
    <div class="text-sm text-gray-700">
      <span>显示第 {{ startItem }} - {{ endItem }} 条，共 {{ totalItems }} 条</span>
    </div>

    <!-- 分页控件 -->
    <div class="flex items-center gap-1">
      <!-- 上一页按钮 -->
      <button
        @click="goToPrevPage"
        :disabled="!hasPrevPage"
        class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="sr-only">上一页</span>
      </button>

      <!-- 页码按钮 -->
      <template v-for="page in visiblePages" :key="page">
        <!-- 省略号 -->
        <span v-if="page === '...'" class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
          ...
        </span>
        <!-- 页码 -->
        <button
          v-else
          @click="goToPage(page)"
          :class="[
            page === currentPage
              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 text-sm font-medium'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 text-sm font-medium'
          ]"
        >
          {{ page }}
        </button>
      </template>

      <!-- 下一页按钮 -->
      <button
        @click="goToNextPage"
        :disabled="!hasNextPage"
        class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="sr-only">下一页</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PaginationData } from '../types/admin'

// 定义 props
const props = defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}>()

// 定义事件
const emit = defineEmits<{
  goToPage: [page: number]
  prevPage: []
  nextPage: []
  changeItemsPerPage: [limit: number]
}>()

// 每页显示数量选项
const itemsPerPageOptions = [10, 20, 50, 100]

// 计算当前页显示的条目范围
const startItem = computed(() => {
  return Math.min((props.currentPage - 1) * props.itemsPerPage + 1, props.totalItems)
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
})

// 计算可见页码
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const current = props.currentPage
  const total = props.totalPages

  if (total <= 7) {
    // 如果总页数不超过7页，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 总页数超过7页时，智能显示页码
    if (current <= 4) {
      // 当前页在前4页
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // 当前页在后4页
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

// 方法
const goToPage = (page: number | string) => {
  if (typeof page === 'number') {
    emit('goToPage', page)
  }
}

const goToPrevPage = () => {
  emit('prevPage')
}

const goToNextPage = () => {
  emit('nextPage')
}

const handleItemsPerPageChange = (event: Event) => {
  const select = event.target as HTMLSelectElement
  emit('changeItemsPerPage', parseInt(select.value))
}
</script>