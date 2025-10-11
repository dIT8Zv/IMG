import { ref, computed, watch } from 'vue'
import type { ImageItem, SortOption, AdminStats, PaginationData, PaginatedImageResponse } from '../types/admin'
import { useAuth } from '@/composables/useAuth'
import { ADMIN_URLS } from '@/config/api'

export function useImageManagement() {
  const auth = useAuth()
  
  // 状态
  const loading = ref(false)
  const images = ref<ImageItem[]>([])
  const searchQuery = ref('')
  const sortBy = ref<SortOption>('created_desc')
  const pagination = ref<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  })
  const itemsPerPage = ref(20)
  const searchTimeout = ref<number | null>(null)

  // 计算属性 - 移除客户端过滤，因为现在由后端处理
  const sortedImages = computed(() => {
    // 直接返回后端返回的数据，后端已经处理了搜索和排序
    return [...images.value]
  })

  // 监听搜索查询变化，实现防抖
  watch(searchQuery, () => {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }

    searchTimeout.value = window.setTimeout(() => {
      handleSearch()
    }, 500)
  })

  // 监听排序变化
  watch(sortBy, () => {
    if (pagination.value) {
      pagination.value.currentPage = 1
    }
    loadImages(1)
  })

  const stats = computed<AdminStats>(() => ({
    totalImages: pagination.value?.totalItems || 0,
    totalSize: images.value.reduce((total, img) => total + (img.file_size || 0), 0),
    latestUpload: images.value.length === 0 ? null : Math.max(...images.value.map(img => new Date(img.created_at).getTime()))
  }))

  // 获取图片上传者信息
  const loadImageUploaders = async () => {
    try {
      // 为每个图片获取上传者信息
      const uploaderPromises = images.value.map(async (img) => {
        try {
          const response = await fetch(`${ADMIN_URLS.IMAGE_UPLOADERS}/${img.id}/uploaders`, {
            headers: {
              'Authorization': `Bearer ${auth.token.value}`,
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            console.warn(`Failed to get uploaders for image ${img.id}: ${response.status}`)
            return { imageId: img.id, uploaders: [] }
          }

          const data = await response.json()
          if (data.success) {
            return { imageId: img.id, uploaders: data.data.uploaders || [] }
          } else {
            console.warn(`获取图片 ${img.id} 上传者信息失败:`, data.message)
            return { imageId: img.id, uploaders: [] }
          }
        } catch (error) {
          console.error(`Failed to load uploaders for image ${img.id}:`, error)
          return { imageId: img.id, uploaders: [] }
        }
      })

      const results = await Promise.all(uploaderPromises)
      
      // 创建一个映射，将图片ID映射到上传者信息
      const uploadersMap = new Map()
      results.forEach(result => {
        uploadersMap.set(result.imageId, result.uploaders)
      })

      // 更新图片数据，添加上传者信息
      images.value = images.value.map(img => ({
        ...img,
        uploaders: uploadersMap.get(img.id) || []
      }))

      console.log('Frontend received uploaders for', results.length, 'images')
    } catch (error) {
      console.error('Failed to load image uploaders:', error)
    }
  }

  // 方法
  const loadImages = async (page: number = 1, append: boolean = false) => {
    loading.value = true
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.value.toString(),
        sort: sortBy.value
      })

      if (searchQuery.value.trim()) {
        params.append('search', searchQuery.value.trim())
      }

      const response = await fetch(`${ADMIN_URLS.IMAGES}?${params}`, {
        headers: {
          'Authorization': `Bearer ${auth.token.value}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: any = await response.json()
      console.log('Raw API response:', data)

      if (data.success) {
        const newImages = data.data.map((img: any) => ({
          id: img.id,
          filename: img.filename,
          original_name: img.original_name,
          file_size: img.file_size,
          size: img.file_size, // 兼容原有属性名
          created_at: img.created_at,
          mime_type: img.mime_type,
          url: img.url,
          upload_ip: img.upload_ip,
          uploaders: img.uploaders || [] // 直接使用后端返回的uploaders数据
        }))

        if (append) {
          images.value = [...images.value, ...newImages]
        } else {
          images.value = newImages
        }

        // 检查是否有分页信息
        if (data.pagination) {
          console.log('Using backend pagination:', data.pagination)
          pagination.value = data.pagination
        } else {
          // 后端不支持分页，使用客户端分页作为后备方案
          console.log('Backend does not support pagination, using client-side pagination')
          const totalItems = data.data.length
          const totalPages = Math.ceil(totalItems / itemsPerPage.value)

          pagination.value = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
            itemsPerPage: itemsPerPage.value,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }

          // 客户端分页：只显示当前页的数据
          const startIndex = (page - 1) * itemsPerPage.value
          const endIndex = startIndex + itemsPerPage.value
          images.value = newImages.slice(startIndex, endIndex)
        }

        console.log('Final images for current page:', images.value.length)
        console.log('Final pagination info:', pagination.value)
      } else {
        throw new Error(data.message || '获取图片列表失败')
      }
    } catch (error) {
      console.error('Failed to load images:', error)
      alert('获取图片列表失败：' + (error as Error).message)
    } finally {
      loading.value = false
    }
  }

  const refreshImages = () => {
    pagination.value.currentPage = 1
    loadImages(1)
  }

  // 分页方法
  const goToPage = (page: number) => {
    if (pagination.value && page >= 1 && page <= pagination.value.totalPages) {
      pagination.value.currentPage = page
      loadImages(page)
    }
  }

  const nextPage = () => {
    if (pagination.value && pagination.value.hasNextPage) {
      goToPage(pagination.value.currentPage + 1)
    }
  }

  const prevPage = () => {
    if (pagination.value && pagination.value.hasPrevPage) {
      goToPage(pagination.value.currentPage - 1)
    }
  }

  const changeItemsPerPage = (newLimit: number) => {
    itemsPerPage.value = newLimit
    if (pagination.value) {
      pagination.value.currentPage = 1
    }
    loadImages(1)
  }

  // 重置搜索时回到第一页
  const handleSearch = () => {
    if (pagination.value) {
      pagination.value.currentPage = 1
    }
    loadImages(1)
  }

  return {
    // 状态
    loading,
    images,
    searchQuery,
    sortBy,
    pagination,
    itemsPerPage,

    // 计算属性
    sortedImages,
    stats,

    // 方法
    loadImages,
    refreshImages,
    goToPage,
    nextPage,
    prevPage,
    changeItemsPerPage,
    handleSearch
  }
}