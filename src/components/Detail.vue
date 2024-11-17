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

function articleDetailReq() {
    var api = "/article/detail/"+route.params.id;
    var params = {}

    instance.get(api, params).then((res) => {
        console.log(res)
        if (res["code"] == 200) {
            text.value = res["text"]
        }
    }).catch((err) => {
        console.log(err)
    })
}

onMounted(() => {
    articleDetailReq();
})

</script>

<template>
    <MdPreview :editorId="id" :modelValue="text" :theme="theme" />
    {{ $route.params.id }}
</template>
```

<style>
.md-editor-previewOnly {
    background-color: var(--bPageBgColor);
}
</style>