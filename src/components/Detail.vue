<script setup>
import { ref, computed, onMounted } from 'vue';
import instance from "@/utils/request";
import { MdPreview, MdCatalog } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import { useDark } from '@vueuse/core';
import { useRoute } from 'vue-router'


const route = useRoute()

const dark = useDark();
const theme = computed(() => dark.value ? 'dark' : 'default');

const id = 'preview-only';
const text = ref(`# this is test page`);
const isLoaded = ref(false); // 标记是否加载完成
function articleDetailReq() {
    var api = "/article/detail/"+route.params.id;
    var params = {}

    instance
        .get(api)
        .then((res) => {
            console.log(res);
            if (res["code"] === 200) {
                text.value = res["text"];
            } else {
                text.value = "Failed to load the article. Please try again.";
            }
        })
        .catch((err) => {
            console.log(err);
            text.value = "Error loading the article.";
        })
        .finally(() => {
            isLoaded.value = true; // 数据加载完成
        });
}

onMounted(() => {
    articleDetailReq();
})

</script>
<template>
    <!-- 数据未加载完成时显示加载提示 -->
    <div v-if="!isLoaded">Loading...</div>
    <!-- 数据加载完成后显示内容 -->
    <div v-else>
        <MdPreview :editorId="id" :modelValue="text" :theme="theme" />
    </div>
</template>
```

<style>
.md-editor-previewOnly {
    background-color: var(--bPageBgColor);
}
</style>