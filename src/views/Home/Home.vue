<template>
  <section class="Home container mx-auto px-4 py-8 max-w-4xl">
    <!-- Hero Section -->
    <div class="text-center mb-10">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        琉璃月图床
      </h1>
      <p class="text-lg text-gray-600 mb-8">
        Minekuai Team 制作的高性能图片存储服务
      </p>
    </div>

    <!-- Upload Section -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-900 mb-3">上传您的图片</h2>
        <p class="text-base text-gray-600">支持 JPG、PNG、GIF、WebP 等格式，单个文件最大 15MB</p>
      </div>

      <!-- Upload Component -->
      <Upload v-model="fileList" :UploadConfig="UploadConfig" :uploadAPI="uploadAPI" />

      <!-- Upload Tools -->
      <div v-show="fileList.length" class="flex justify-center gap-4 mt-6">
        <Button variant="outline" @click="fileList = []" class="px-6 py-3 text-base">
          清空列表
        </Button>
        <Button @click="vh.CopyText(fileList.map((i: any) => i.upload_blob).join('\n'))" class="px-6 py-3 text-base">
          复制全部链接
        </Button>
      </div>
    </div>

    <!-- Results -->
    <ResList v-model="fileList" :nodeHost="nodeHost" />
  </section>
</template>

<script setup lang="ts">
import vh from 'vh-plugin';
import { ref, watch } from 'vue';
import { formatURL } from '@/utils/index';
import { Button } from '@/components/ui/button';
import Upload from '@/components/Upload/Upload.vue';
import ResList from '@/components/ResList/ResList.vue';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// IPFS节点
const nodeHost = ref<string>(import.meta.env.VITE_IMG_API_URL || location.origin);
// 上传接口
const uploadAPI = ref<string>(`${import.meta.env.VITE_IMG_API_URL || location.origin}/upload`);
// 上传配置
const UploadConfig = ref<any>({
  AcceptTypes: 'image/*', // 允许上传的类型，使用逗号分隔
  Max: 0, //多选个数，0为不限制
  MaxSize: 15, //单个文件大小限制，单位：MB
});
// 上传列表
const fileList = ref<Array<any>>(JSON.parse(localStorage.getItem('zychUpImageList') || '[]'));
watch(fileList, (newVal) => {
  localStorage.setItem(
    'zychUpImageList',
    JSON.stringify(
      newVal
        .filter((i: any) => i.upload_status == 'success')
        .map((i: any) => {
          i.upload_blob = formatURL({ nodeHost: nodeHost.value }, i.upload_result);
          return i;
        }),
    ),
  );
});
</script>

<style scoped lang="less">
@import 'Home.less';
</style>