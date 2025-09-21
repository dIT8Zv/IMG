<template>
  <section class="ResList">
    <div class="item" v-for="(i, idx) in props.modelValue" :key="idx">
      <img v-if="i.upload_blob" class="thumb" :src="i.upload_result && i.upload_status === 'success' ? i.upload_blob : LoadingImg" />
      <div class="value" :class="{ active: !i.upload_result || i.upload_status === 'uploading', error: i.upload_status === 'error' }">
        <!-- 成功状态 -->
        <template v-if="i.upload_status === 'success' && i.upload_result">
          <p><input :value="formatURL(props, i.upload_result)" type="text" readonly @click="copyCodeValue(formatURL(props, i.upload_result))" /> <span>URL</span></p>
          <p><input :value="formatURL(props, i.upload_result, 'md')" type="text" readonly @click="copyCodeValue(formatURL(props, i.upload_result, 'md'))" /> <span>Markdown</span></p>
        </template>
        <!-- 上传中状态 -->
        <template v-else-if="i.upload_status === 'uploading'">
          <p><input value="上传中..." type="text" readonly /> <span>状态</span></p>
          <p><input value="请稍候..." type="text" readonly /> <span>进度</span></p>
        </template>

        <!-- 错误状态 -->
        <template v-else-if="i.upload_status === 'error'">
          <p><input :value="i.upload_result?.error || '上传失败'" type="text" readonly class="error-input" /> <span class="error-span">错误</span></p>
          <p><input :value="i.name || '未知文件'" type="text" readonly /> <span>文件名</span></p>
        </template>
        <!-- 默认状态 -->
        <template v-else>
          <p><input value="" type="text" readonly /> <span>URL</span></p>
          <p><input value="" type="text" readonly /> <span>Markdown</span></p>
        </template>
      </div>
      <HoverCard v-if="i.upload_status === 'success' && i.upload_result" :open-delay="0" :close-delay="0">
        <HoverCardTrigger as-child>
          <QrcodeVue class="qrcode" :value="formatURL(props, i.upload_result)" :size="56" level="H" />
        </HoverCardTrigger>
        <HoverCardContent class="w-max h-max"><QrcodeVue class="qrcode scale" :value="formatURL(props, i.upload_result)" :size="666" level="H" /></HoverCardContent>
      </HoverCard>

    </div>
  </section>
</template>
<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import { formatURL } from '@/utils/index';
import { useToast } from '@/components/ui/toast/use-toast';
const { toast } = useToast();
import LoadingImg from '@/assets/images/loading.gif';
const props = defineProps(['modelValue', 'nodeHost', 'uploadAPI']);
const emits = defineEmits(['update:modelValue']);
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

// 复制CODE
const copyCodeValue = async (v: string) => {
  let vhCopyStatus: any = false;
  try {
    await navigator.clipboard.writeText(v);
    vhCopyStatus = true;
  } catch {
    const i = document.createElement('textarea');
    i.value = v;
    document.body.appendChild(i);
    i.select();
    vhCopyStatus = document.execCommand('copy');
    document.body.removeChild(i);
  } finally {
    if (vhCopyStatus) toast({ title: 'Tips', description: '复制成功' });
  }
};
</script>

<style scoped lang="less">
@import 'ResList.less';

.error-input {
  border-color: #dc3545 !important;
  background-color: #f8d7da;
  color: #721c24;
}

.error-span {
  color: #dc3545;
  font-weight: 500;
}


</style>
