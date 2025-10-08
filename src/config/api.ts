// API配置文件 - 统一管理所有API URL
export const API_BASE_URL = 'https://api.liuliyue.cn'

export const API_CONFIG = {
  // 基础URL - 原始后端地址
  BASE_URL: API_BASE_URL,

  // 认证相关API
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    USER: '/auth/user',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },

  // 邮箱验证相关API
  EMAIL: {
    SEND_CODE: '/email/send-code',
    VERIFY_CODE: '/email/verify-code',
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
    IMAGE_UPLOADERS: '/api/images',
    EDGEONE_STATUS: '/admin/edgeone/status',
    EDGEONE_PURGE: '/admin/edgeone/purge',
    EDGEONE_PREFETCH: '/admin/edgeone/prefetch',
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
  FORGOT_PASSWORD: getApiUrl(API_CONFIG.AUTH.FORGOT_PASSWORD),
} as const

// 邮箱验证API URLs
export const EMAIL_URLS = {
  SEND_CODE: getApiUrl(API_CONFIG.EMAIL.SEND_CODE),
  VERIFY_CODE: getApiUrl(API_CONFIG.EMAIL.VERIFY_CODE),
} as const

// 管理员API URLs
export const ADMIN_URLS = {
  IMAGES: getApiUrl(API_CONFIG.ADMIN.IMAGES),
  DELETE_IMAGE: (filename: string) => getApiUrl(`${API_CONFIG.ADMIN.DELETE_IMAGE}/${filename}`),
  IMAGE_UPLOADERS: getApiUrl(API_CONFIG.ADMIN.IMAGE_UPLOADERS),
  EDGEONE_STATUS: getApiUrl(API_CONFIG.ADMIN.EDGEONE_STATUS),
  EDGEONE_PURGE: getApiUrl(API_CONFIG.ADMIN.EDGEONE_PURGE),
  EDGEONE_PREFETCH: getApiUrl(API_CONFIG.ADMIN.EDGEONE_PREFETCH),
} as const