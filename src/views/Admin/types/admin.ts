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
  uploaders?: ImageUploader[] // 上传者信息列表
}

// 图片上传者信息
export interface ImageUploader {
  user_id: number
  username: string
  created_at: string
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
  totalSizeHuman: string // 格式化的总存储大小（从后端获取）
  latestUpload: number | null
}

// 分页相关类型
export interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  totalSize: number
  totalSizeHuman: string
  currentPageSize: number
  currentPageSizeHuman: string
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedImageResponse {
  success: boolean
  data: ImageItem[]
  pagination: PaginationData
  message?: string
}