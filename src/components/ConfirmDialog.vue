<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
    @click="handleCancel"
  >
    <div
      class="bg-white rounded-lg max-w-md w-full p-6"
      @click.stop
    >
      <div class="flex items-center mb-4">
        <div class="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      </div>
      
      <div class="text-center mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-500">{{ message }}</p>
        <div v-if="details" class="mt-3 p-3 bg-gray-50 rounded-md text-left">
          <p class="text-sm text-gray-700 font-mono">{{ details }}</p>
        </div>
      </div>

      <div class="flex gap-3 justify-end">
        <button
          @click="handleCancel"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :disabled="loading"
        >
          取消
        </button>
        <button
          @click="handleConfirm"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
        >
          {{ loading ? '处理中...' : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isOpen: boolean
  title: string
  message: string
  details?: string
  confirmText?: string
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '确认'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const loading = ref(false)

const handleConfirm = () => {
  loading.value = true
  emit('confirm')
}

const handleCancel = () => {
  if (!loading.value) {
    emit('cancel')
  }
}

// 暴露方法供父组件调用
const setLoading = (value: boolean) => {
  loading.value = value
}

defineExpose({
  setLoading
})
</script>