<template>
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <h1 class="text-xl font-semibold text-gray-900">后台管理</h1>
        </div>
        <div class="flex items-center gap-4">
          <button
            @click="$emit('goBack')"
            class="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            返回主页
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// 定义事件
defineEmits<{
  goBack: []
}>()
</script>