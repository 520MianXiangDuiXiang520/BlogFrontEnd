<script setup>
import { computed, ref, shallowRef, onMounted } from 'vue';
// 移除静态导入，改为动态导入
// import { MdPreview } from 'md-editor-v3';
// import 'md-editor-v3/lib/preview.css';
import markdownText from '@/assets/about.md';
import { useDark } from '@vueuse/core';

const dark = useDark();
const theme = computed(() => dark.value ? 'dark' : 'default');
const text = markdownText;

// 动态导入 md-editor-v3 组件
const MdPreview = shallowRef(null);
const isEditorLoaded = ref(false);

// 加载编辑器
const loadEditor = async () => {
    try {
        const { MdPreview: Preview } = await import('md-editor-v3');
        await import('md-editor-v3/lib/preview.css');
        MdPreview.value = Preview;
        isEditorLoaded.value = true;
    } catch (error) {
        console.error('Failed to load md-editor-v3:', error);
    }
};

onMounted(async () => {
    await loadEditor();
});

</script>

<template>
  <main>
    <div class="about">
      <!-- 编辑器加载中显示加载提示 -->
      <div v-if="!isEditorLoaded" class="loading-container">
        <div class="loading">Loading...</div>
      </div>
      <!-- 编辑器加载完成后显示 -->
      <component v-else :is="MdPreview" editorId="preview-only" :modelValue="text" :theme="theme" />
    </div>
  </main>
</template>

<style>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading {
  font-size: 16px;
  color: #666;
}
</style>
