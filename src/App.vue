<template>
  <Header v-if="!isFullPageLayout" title="琉璃月图床" />
  <main><RouterView /></main>
  <Footer v-if="!isFullPageLayout" />
  <Toaster />
  <AuthModal />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from '@/components/Header/Header.vue';
import Footer from '@/components/Footer/Footer.vue';
import AuthModal from '@/components/AuthModal.vue';
import { Toaster } from '@/components/ui/toast';

const route = useRoute();

// 检查是否为全页面布局（不显示Header和Footer的页面）
const isFullPageLayout = computed(() => {
  return route.name === 'AccessDenied' || route.name === 'NotFound' || route.name === 'NotFoundCatch' || route.name === 'ResetPassword';
});
</script>

<style scoped></style>
