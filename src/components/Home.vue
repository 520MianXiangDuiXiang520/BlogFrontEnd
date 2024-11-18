<script setup>
import { ref, onMounted } from 'vue'
import instance from "@/utils/request";
import { useRouter, useRoute } from 'vue-router'
import { checkLogined, checkAuth } from "@/utils/auth"
import { formatTimestamp } from '@/utils/date'
import { storage } from '@/utils/storage'

const router = useRouter()
const route = useRoute()
const totalSize = ref(0)
const articles = ref([])
let needDeleteArticleId = 0;
const deleteDialogVisible = ref(false);
const articlecomponentKey = ref(0);
const currentPage = ref(1);
const pageSize = ref(15);
const homeTag = ref(''); // 在首页选标签 不刷新页面

function articleListReq() {
    var api = "/article/list";
    var params = {
        page: currentPage.value,
        page_size: pageSize.value
    }
    let tagName = route.query.tag;
    if(!tagName || tagName == "") {
        tagName = homeTag.value;
    }

    if (tagName && tagName != "") {
        params.tag = getTagIdByTagName(tagName)
        console.log(getTagIdByTagName(tagName));
    }

    instance.get(api, { params }).then((res) => {
        if (res["code"] == 200) {
            totalSize.value = res["TotalSize"];
            articles.value = res["Articles"];
            console.log(res)
            articlecomponentKey.value++;
        }
    }).catch((err) => {
        console.log(err)
    })
}

// [{"id": 1, "name": "xxx"}]
const allTags = ref([]);
async function tagsListReq() {
    var api = "/tag/list";
    await instance.get(api, {}).then((res) => {
        console.log(res)
        if (res["code"] == 200) {
            allTags.value = res["tags"]
        }
    }).catch((err) => {
        console.log(err)
    })
}

function getTagNameByTagId(id) {
    if (Array.isArray(allTags.value)) {
        const tag = allTags.value.find(tag => tag.id === id);
        return tag ? tag.name : null;
    }
    return null;
}

function getTagIdByTagName(name) {
    console.log(allTags.value);
    if (Array.isArray(allTags.value)) {
        const tag = allTags.value.find(tag => tag.name === name);
        console.log(tag);

        return tag ? tag.id : null;
    }
    return null;
}

function goDetail(id) {
    router.push("/detail/" + id)
    
}

function goEdit(id) {
    router.push("/editor/" + id)
}

async function goHomeWithTag(tagName) {
    // await router.push("/?tag=" + tagName)
    // window.location.reload();
    homeTag.value = tagName;
    articles.value = [];
    articleListReq();

}

function deleteArticle(id) {
    needDeleteArticleId = id;
    deleteDialogVisible.value = true;
}

function handleDeletDailogClose() {
    needDeleteArticleId = 0
}

function doDeleteArticleReq() {
    if (!checkAuth()) { return }
    var api = "/article/delete/" + needDeleteArticleId;
    instance.post(api, {}).then((res) => {
        console.log(res)
        if (res["code"] == 200) {
            ElMessage.success("success!!!");
            deleteDialogVisible.value = false;
            articleListReq();
        }
    }).catch((err) => {
        console.log(err)
    })
}

function handlePageChange(page, pageSize) {
    storage.set("cur_page", page);
    storage.set("page_size", pageSize);
    articleListReq();
}

async function getTagsAndArticles() {
    await tagsListReq();
    articleListReq();
}

onMounted(() => {
    currentPage.value = storage.getDefault('cur_page', 1);
    pageSize.value = storage.getDefault('page_size', 15);
    getTagsAndArticles();
})

</script>

<template>
    <div class="article-item" v-for="article in articles" :key="articlecomponentKey">
        <el-row class="article-info">
            <el-col :span="24">
                <el-row class="title" @click="goDetail(article['Id'])">
                    <el-col :span="24">
                        <h2>{{ article["name"] }}</h2>
                    </el-col>
                </el-row>
                <el-row class="tags">
                    <el-col :span="24">
                        <span v-if="article['tag_ids']" v-for="tagId in article['tag_ids']"
                            @click="goHomeWithTag(getTagNameByTagId(tagId))">{{
                                getTagNameByTagId(tagId) }} <el-divider direction="vertical" border-style="dashed" /></span>

                        <span v-else>NoTag <el-divider direction="vertical" border-style="dashed" /></span>

                        <el-text class="up-date" size="small">{{ formatTimestamp(article['create_ts']) }}</el-text>


                        <el-divider v-if="checkLogined()" direction="vertical" />
                        <el-text v-if="checkLogined()" class="up-date" size="small" type="primary"
                            @click="goEdit(article['Id'])">编辑</el-text>
                        <el-divider v-if="checkLogined()" direction="vertical" />
                        <el-text v-if="checkLogined()" class="up-date" size="small" type="danger"
                            @click="deleteArticle(article['Id'])">删除</el-text>
                    </el-col>
                </el-row>

                <el-row class="abstract" @click="goDetail(article['Id'])">
                    <el-col :span="24">
                        <el-text size="default">{{ article["abstract"] }}</el-text>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
    </div>

    <div class="demo-pagination-block pager">
        <el-pagination :hide-on-single-page="true" v-model:current-page="currentPage" v-model:page-size="pageSize"
            :page-sizes="[10, 15, 20, 25]" size="default" :disabled="false" :background="false"
            layout="total, sizes, prev, pager, next, jumper" :total="totalSize" @change="handlePageChange" />
    </div>

    <!-- 删除确认 -->
    <el-dialog v-model="deleteDialogVisible" title="删除确认" width="500" :before-close="handleDeletDailogClose">
        <span>确认要删除这篇文章吗</span>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="deleteDialogVisible = false">Cancel</el-button>
                <el-button type="danger" @click="doDeleteArticleReq()">
                    Delete
                </el-button>
            </div>
        </template>
    </el-dialog>

</template>



<style>
.pager {
    display: flex;
    justify-content: center;
}

.article-item {
    margin-bottom: 35px;
}

.tags {
    margin: 3px 0px 3px 0px;
}

.title {
    color: var(--titleColor);
}
</style>