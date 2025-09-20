// Admin 相关的类型定义
export interface ImageItem {
  id: string
  filename: string
  original_name?: string
  file_size: number
  size?: number // 兼容原有属性名
  created_at: string
  mime_type?: string
  url?: string
  upload_ip?: string
}

export interface User {
  id: number
  username: string
  email?: string
  permission_level: number
}

export type SortOption = 'created_desc' | 'created_asc' | 'size_desc' | 'size_asc'
export type ViewMode = 'grid' | 'list'

export interface AdminStats {
  totalImages: number
  totalSize: number
  latestUpload: number | null
}