<template>
  <Header v-if="!isAccessDeniedPage" title="琉璃月图床" />
  <main><RouterView /></main>
  <Footer v-if="!isAccessDeniedPage" />
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

// 检查是否为访问拒绝页面
const isAccessDeniedPage = computed(() => {
  return route.name === 'AccessDenied';
});
</script>

<style scoped></style>
