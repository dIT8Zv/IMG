<template>
  <div ref="containerRef" class="container bg-white flex flex-col">
    <!-- Main Content -->
    <div class="main-content flex-1 flex items-center justify-center px-6 py-8 min-h-0">
      <div class="max-w-md w-full text-center">
        <!-- Error Code -->
        <div class="mb-8">
          <h1 class="text-8xl md:text-9xl font-bold text-gray-300 leading-none">
            404
          </h1>
        </div>

        <!-- Error Message -->
        <div class="mb-8">
          <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
            页面未找到
          </h2>
          <p class="text-gray-600 text-lg leading-relaxed mb-6">
            抱歉，您访问的页面不存在或已被移除。
          </p>
          <p class="text-gray-500 text-sm">
            错误 404: 页面未找到
          </p>
        </div>

        <!-- Ray ID -->
        <div class="mb-8 text-sm text-gray-400">
          <p>Ray ID: <span class="font-mono">{{ rayId }}</span></p>
          <p class="mt-1">{{ currentTime }}</p>
        </div>

        <!-- Actions -->
        <div class="space-y-3 mb-16">
          <button
            @click="goBack"
            class="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            返回上一页
          </button>
          <button
            @click="goHome"
            class="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            回到首页
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="py-4 px-6 border-t border-gray-100 flex-shrink-0">
      <div class="max-w-4xl mx-auto">
        <div class="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <div class="mb-4 md:mb-0">
            <p>性能与安全服务由 
              <span class="font-semibold text-orange-500">琉璃月</span> 提供
            </p>
          </div>
          <div class="flex items-center space-x-1">
            <span>琉璃月图床</span>
            <span class="mx-1">•</span>
            <span>{{ currentYear }}</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 生成随机ID
const rayId = ref('')
const currentTime = ref('')

const currentYear = computed(() => new Date().getFullYear())

// 动态高度计算
const containerRef = ref<HTMLElement>()
const footerHeight = ref(80)

// 计算实际的footer高度
const calculateFooterHeight = () => {
  const footer = document.querySelector('footer')
  if (footer) {
    footerHeight.value = footer.offsetHeight
    // 更新CSS变量
    document.documentElement.style.setProperty('--footer-height', `${footerHeight.value}px`)
  }
}

// 响应式高度调整
const updateViewportHeight = () => {
  // 使用动态视口高度
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
  
  // 计算可用高度百分比
  const availableHeight = window.innerHeight - footerHeight.value
  const heightPercentage = (availableHeight / window.innerHeight) * 100
  document.documentElement.style.setProperty('--available-height', `${heightPercentage}%`)
}

const generateRandomId = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const formatDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`
}

const goBack = () => {
  window.history.back()
}

const goHome = () => {
  router.push('/')
}

onMounted(async () => {
  rayId.value = generateRandomId(16)
  currentTime.value = formatDateTime()
  
  // 等待DOM渲染完成后计算高度
  await nextTick()
  calculateFooterHeight()
  updateViewportHeight()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    calculateFooterHeight()
    updateViewportHeight()
  })
  
  // 监听屏幕方向变化（移动设备）
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      calculateFooterHeight()
      updateViewportHeight()
    }, 100)
  })
})
</script>

<style scoped>
/* 响应式高度计算 */
.container {
  --header-height: 0px; /* NotFound页面没有header */
  --footer-height: 80px; /* footer大约高度，会被JS动态更新 */
  --content-padding: 2rem;
  --vh: 1vh; /* 动态视口高度单位 */
  --available-height: 85%; /* 可用高度百分比，会被JS动态更新 */
  
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100); /* 使用动态视口高度 */
}

.main-content {
  /* 使用多种方式确保兼容性 */
  min-height: calc(100vh - var(--footer-height) - var(--content-padding));
  min-height: calc(var(--vh, 1vh) * 100 - var(--footer-height) - var(--content-padding));
  min-height: var(--available-height, 85%);
  /* 确保底部有足够空间，防止footer遮挡 */
  padding-bottom: calc(var(--footer-height) + 1rem);
}

/* 响应式调整 */
@media (max-height: 600px) {
  .container {
    --footer-height: 60px;
    --content-padding: 1rem;
  }
  
  .main-content {
    padding-bottom: calc(var(--footer-height) + 0.5rem);
  }
}

@media (max-height: 480px) {
  .container {
    --footer-height: 50px;
    --content-padding: 0.5rem;
  }
  
  .main-content {
    padding-bottom: calc(var(--footer-height) + 0.5rem);
    padding-top: 1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* 针对410px左右高度的特殊处理 */
@media (max-height: 420px) and (min-height: 401px) {
  .main-content {
    padding-bottom: calc(var(--footer-height) + 2rem);
    padding-top: 0.5rem;
  }
}

/* 确保在小屏幕上内容不会被截断 */
@media (max-height: 400px) {
  .container {
    height: auto;
    min-height: 100vh;
  }
  
  .main-content {
    padding-bottom: calc(var(--footer-height) + 2.5rem);
    padding-top: 0.5rem;
  }
}

.error-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-code {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button {
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 确保字体渲染清晰 */
h1, h2 {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>