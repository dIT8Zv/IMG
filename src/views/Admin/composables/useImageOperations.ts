import { ref } from 'vue'
import type { ImageItem } from '../types/admin'
import { useAuth } from '@/composables/useAuth'
import { API_CONFIG, ADMIN_URLS } from '@/config/api'

export function useImageOperations() {
  const auth = useAuth()
  
  // 状态
  const selectedImage = ref<ImageItem | null>(null)
  const fullscreenImage = ref<ImageItem | null>(null)

  // 方法
  const getImageUrl = (filename: string) => {
    return `${API_CONFIG.BASE_URL}/v2/${filename}`
  }

  const openImageModal = (image: ImageItem) => {
    selectedImage.value = image
  }

  const closeImageModal = () => {
    selectedImage.value = null
  }

  const openFullscreenImage = (image: ImageItem) => {
    fullscreenImage.value = image
  }

  const closeFullscreenImage = () => {
    fullscreenImage.value = null
  }

  const copyImageUrl = (image: ImageItem) => {
    const url = getImageUrl(image.filename)
    navigator.clipboard.writeText(url).then(() => {
      alert('链接已复制到剪贴板')
    })
  }

  const deleteImage = async (image: ImageItem, onSuccess?: (imageId: string) => void) => {
    if (confirm(`确定要删除图片 "${image.filename}" 吗？`)) {
      try {
        const response = await fetch(ADMIN_URLS.DELETE_IMAGE(image.filename), {
          method: 'DELETE',
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
          // 调用成功回调
          if (onSuccess) {
            onSuccess(image.id)
          }
          closeImageModal()
          alert('图片删除成功')
        } else {
          throw new Error(data.message || '删除失败')
        }
      } catch (error) {
        console.error('Failed to delete image:', error)
        alert('删除图片失败：' + (error as Error).message)
      }
    }
  }

  return {
    // 状态
    selectedImage,
    fullscreenImage,
    
    // 方法
    getImageUrl,
    openImageModal,
    closeImageModal,
    openFullscreenImage,
    closeFullscreenImage,
    copyImageUrl,
    deleteImage
  }
}