<template>
  <div class="min-h-screen bg-white">
    <!-- Admin Header -->
    <AdminHeader @go-back="goBack" />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


      <!-- Stats Cards -->
      <StatsPanel :stats="stats" />

      <!-- Controls -->
      <ImageControls
        :loading="loading"
        :sort-by="sortBy"
        :search-query="searchQuery"
        :view-mode="viewMode"
        :filtered-count="sortedImages.length"
        :total-count="images.length"
        @refresh="refreshImages"
        @update:sort-by="sortBy = $event"
        @update:search-query="searchQuery = $event"
        @update:view-mode="viewMode = $event"
      />

      <!-- Images Content -->
      <div class="p-6">
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p class="mt-2 text-gray-600">加载中...</p>
        </div>

        <div v-else-if="sortedImages.length === 0" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="mt-2 text-gray-600">
            {{ searchQuery.trim() ? '未找到匹配的图片' : '暂无图片' }}
          </p>
          <p v-if="searchQuery.trim()" class="mt-1 text-sm text-gray-500">
            尝试使用不同的关键词搜索
          </p>
        </div>

        <!-- 网格视图 -->
        <ImageGrid
          v-else-if="viewMode === 'grid'"
          :images="sortedImages"
          :can-delete="canDeleteImages"
          @open-modal="openImageModal"
          @delete-image="handleDeleteImage"
        />

        <!-- 列表视图 -->
        <ImageList
          v-else
          :images="sortedImages"
          :can-delete="canDeleteImages"
          @open-modal="openImageModal"
          @copy-url="copyImageUrl"
          @delete-image="handleDeleteImage"
        />
      </div>
    </main>

    <!-- Image Detail Modal -->
    <ImageModal
      :image="selectedImage"
      :can-delete="canDeleteImages"
      @close="closeImageModal"
      @copy-url="copyImageUrl"
      @delete-image="handleDeleteImage"
      @open-fullscreen="openFullscreenImage"
    />

    <!-- Fullscreen Image Modal -->
    <FullscreenModal
      :image="fullscreenImage"
      @close="closeFullscreenImage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ViewMode } from './types/admin'

// 组件导入
import AdminHeader from './components/AdminHeader.vue'
import StatsPanel from './components/StatsPanel.vue'
import ImageControls from './components/ImageControls.vue'
import ImageGrid from './components/ImageGrid.vue'
import ImageList from './components/ImageList.vue'
import ImageModal from './components/ImageModal.vue'
import FullscreenModal from './components/FullscreenModal.vue'

// Composables 导入
import { useImageManagement } from './composables/useImageManagement'
import { useImageOperations } from './composables/useImageOperations'
import { useAdminPermissions } from './composables/useAdminPermissions'

// Router
const router = useRouter()

// 视图模式状态
const viewMode = ref<ViewMode>('grid')

// 使用 composables
const {
  loading,
  images,
  searchQuery,
  sortBy,
  sortedImages,
  stats,
  loadImages,
  refreshImages
} = useImageManagement()

const {
  selectedImage,
  fullscreenImage,
  openImageModal,
  closeImageModal,
  openFullscreenImage,
  closeFullscreenImage,
  copyImageUrl,
  deleteImage
} = useImageOperations()

const {
  canDeleteImages,
  currentUser,
  isReallyLoggedIn
} = useAdminPermissions()

// 方法
const goBack = () => {
  router.push('/')
}

const handleDeleteImage = (image: any) => {
  deleteImage(image, (imageId: string) => {
    // 从列表中移除已删除的图片
    images.value = images.value.filter(img => img.id !== imageId)
  })
}

// 生命周期
onMounted(() => {
  loadImages()
})
</script>