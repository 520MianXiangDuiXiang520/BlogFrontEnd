<script setup>
import { computed } from 'vue';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import markdownText from '@/assets/about.md';
import { useDark } from '@vueuse/core';

const dark = useDark();
const theme = computed(() => dark.value ? 'dark' : 'default');
const text=markdownText;


</script>

<template>
  <main>
    <div class="about">
      <MdPreview editorId="preview-only" :modelValue="text" :theme="theme" />
    </div>
  </main>

</template>

<style>

</style>
