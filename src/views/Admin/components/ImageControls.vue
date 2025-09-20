<template>
  <div class="bg-white rounded-lg shadow mb-8">
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium text-gray-900">图片列表</h2>
        <div class="flex items-center gap-3">
          <button
            @click="$emit('refresh')"
            :disabled="loading"
            class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg v-if="!loading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <svg v-else class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? '加载中...' : '刷新' }}
          </button>
        </div>
      </div>

      <!-- 控制面板 -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- 左侧：排序选项和搜索 -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <!-- 排序选项 -->
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-700">排序：</span>
            <div class="relative">
              <select
                :value="sortBy"
                @change="$emit('update:sort-by', ($event.target as HTMLSelectElement).value as SortOption)"
                class="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="created_desc">创建时间 (新→旧)</option>
                <option value="created_asc">创建时间 (旧→新)</option>
                <option value="size_desc">文件大小 (大→小)</option>
                <option value="size_asc">文件大小 (小→大)</option>
              </select>
              <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- 搜索框 -->
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-700">搜索：</span>
            <div class="relative">
              <input
                :value="searchQuery"
                @input="$emit('update:search-query', ($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="输入图片名称..."
                class="bg-white border border-gray-300 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-48"
              />
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                v-if="searchQuery"
                @click="$emit('update:search-query', '')"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧：视图切换按钮 -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">视图：</span>
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="$emit('update:view-mode', 'grid')"
              :class="[
                'flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              网格
            </button>
            <button
              @click="$emit('update:view-mode', 'list')"
              :class="[
                'flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              列表
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果统计 -->
    <div v-if="!loading && searchQuery.trim()" class="px-6 pt-4">
      <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span class="text-sm text-blue-800">
            搜索 "<span class="font-medium">{{ searchQuery }}</span>" 找到 {{ filteredCount }} 张图片
            <span v-if="totalCount > 0" class="text-blue-600">（共 {{ totalCount }} 张）</span>
          </span>
          <button
            @click="$emit('update:search-query', '')"
            class="ml-auto text-blue-600 hover:text-blue-800 text-sm underline"
          >
            清除搜索
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SortOption, ViewMode } from '../types/admin'

// 定义 props
defineProps<{
  loading: boolean
  sortBy: SortOption
  searchQuery: string
  viewMode: ViewMode
  filteredCount: number
  totalCount: number
}>()

// 定义事件
defineEmits<{
  refresh: []
  'update:sort-by': [value: SortOption]
  'update:search-query': [value: string]
  'update:view-mode': [value: ViewMode]
}>()
</script>