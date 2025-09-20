// API配置文件 - 统一管理所有API URL
export const API_CONFIG = {
  // 基础URL
  BASE_URL: 'https://api-img.liuliyue.cn',

  // 认证相关API
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    USER: '/auth/user',
  },

  // 图片相关API
  IMAGE: {
    UPLOAD: '/upload',
    DELETE: '/v2/delete',
  },

  // 管理员API
  ADMIN: {
    IMAGES: '/admin/images',
    DELETE_IMAGE: '/admin/images',
  }
} as const

// 生成完整的API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// 认证API URLs
export const AUTH_URLS = {
  LOGIN: getApiUrl(API_CONFIG.AUTH.LOGIN),
  REGISTER: getApiUrl(API_CONFIG.AUTH.REGISTER),
  USER: getApiUrl(API_CONFIG.AUTH.USER),
} as const

// 管理员API URLs
export const ADMIN_URLS = {
  IMAGES: getApiUrl(API_CONFIG.ADMIN.IMAGES),
  DELETE_IMAGE: (filename: string) => getApiUrl(`${API_CONFIG.ADMIN.DELETE_IMAGE}/${filename}`),
} as const