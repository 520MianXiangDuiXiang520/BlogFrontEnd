<script setup>
import { ref, onMounted } from 'vue'
import instance from "@/utils/request";
import { useRouter } from 'vue-router'

const router = useRouter()
const allTags = ref([]);

function tagsListReq() {
    var api = "/tag/list";
    instance.get(api, {}).then((res) => {
        console.log(res)
        if (res["code"] == 200) {
            allTags.value = res["tags"]
        }
    }).catch((err) => {
        console.log(err)
    })
}

function getTagName(name){
    return name == ""? "Empty": name;
}

function goHome(tagName) {
    router.push("/?tag="+tagName)
}

onMounted(() => {
    tagsListReq();
})
</script>

<template>
    <el-row :gutter="10">
        <el-col v-for="tag in allTags" :xs="12" :sm="4" :md="4" :lg="4" :xl="4" class="tag-item">
            <el-card  shadow="hover" @click="goHome(tag.name)">{{ getTagName(tag.name) }}</el-card>
        </el-col>
    </el-row>

</template>

<style>
.tag-item{
    margin-bottom: 10px;
}
</style>