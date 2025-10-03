import { ref, computed } from 'vue'
import type { ImageItem, SortOption, AdminStats } from '../types/admin'
import { useAuth } from '@/composables/useAuth'
import { ADMIN_URLS } from '@/config/api'

export function useImageManagement() {
  const auth = useAuth()
  
  // 状态
  const loading = ref(false)
  const images = ref<ImageItem[]>([])
  const searchQuery = ref('')
  const sortBy = ref<SortOption>('created_desc')

  // 计算属性
  const sortedImages = computed(() => {
    // 首先根据搜索查询过滤图片
    let filtered = [...images.value]
    
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.trim().toLowerCase()
      filtered = filtered.filter(image => {
        // 搜索文件名（包括原始名称和存储名称）
        const filename = (image.filename || '').toLowerCase()
        const originalName = (image.original_name || '').toLowerCase()
        
        return filename.includes(query) || originalName.includes(query)
      })
    }
    
    // 然后根据排序选项排序
    switch (sortBy.value) {
      case 'created_desc':
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'created_asc':
        return filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case 'size_desc':
        return filtered.sort((a, b) => (b.file_size || 0) - (a.file_size || 0))
      case 'size_asc':
        return filtered.sort((a, b) => (a.file_size || 0) - (b.file_size || 0))
      default:
        return filtered
    }
  })

  const stats = computed<AdminStats>(() => ({
    totalImages: images.value.length,
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
  const loadImages = async () => {
    loading.value = true
    try {
      const response = await fetch(ADMIN_URLS.IMAGES, {
        headers: {
          'Authorization': `Bearer ${auth.token.value}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        images.value = data.data.map((img: any) => ({
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

        console.log('Frontend received images with uploaders:', images.value)
        
        // 不再需要单独获取上传者信息，因为后端已经包含了
        // await loadImageUploaders()
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
    loadImages()
  }

  return {
    // 状态
    loading,
    images,
    searchQuery,
    sortBy,
    
    // 计算属性
    sortedImages,
    stats,
    
    // 方法
    loadImages,
    refreshImages
  }
}